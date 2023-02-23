// 自定义连线规则
import { every, find, forEach, some } from 'min-dash';

import inherits from 'inherits-browser';

import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import { getParent, isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

import { isLabel } from 'bpmn-js/lib/util/LabelUtil';

import {
  isExpanded,
  isEventSubProcess,
  isInterrupting,
  hasErrorEventDefinition,
  hasEscalationEventDefinition,
  hasCompensateEventDefinition,
} from 'bpmn-js/lib/util/DiUtil';

import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';

import { getBoundaryAttachment as isBoundaryAttachment } from 'bpmn-js/lib/features/snapping/BpmnSnappingUtil';

/**
 * BPMN specific modeling rule
 */
export default function BpmnRules(this: any, eventBus: any) {
  RuleProvider.call(this, eventBus);
}

inherits(BpmnRules, RuleProvider);

BpmnRules.$inject = ['eventBus'];

BpmnRules.prototype.init = function () {
  this.addRule('connection.start', function (context: { source: any }) {
    var source = context.source;
    return canStartConnection(source);
  });

  this.addRule('connection.create', function (context: { source: any; target: any; hints: {} }) {
    var source = context.source,
      target = context.target,
      hints: any = context.hints || {},
      targetParent = hints.targetParent,
      targetAttach = hints.targetAttach;
    // don't allow incoming connections on
    // newly created boundary events
    // to boundary events
    if (targetAttach) {
      return false;
    }

    // temporarily set target parent for scoping
    // checks to work
    if (targetParent) {
      target.parent = targetParent;
    }

    // 非审批节点不能直接与合并节点相连
    // if (context.source.type !== 'bpmn:Process' && context.target.type !== 'bpmn:Process') {
    //   const sourceType = context.source.type;
    //   const targetType = context.target.type;
    //   if (
    //     (sourceType !== 'bpmn:UserTask' && targetType === 'bpmn:ScriptTask') ||
    //     (sourceType === 'bpmn:ScriptTask' && targetType !== 'bpmn:UserTask')
    //   ) {
    //     return false;
    //   }
    // }

    try {
      return canConnect(source, target);
    } finally {
      // unset temporary target parent
      if (targetParent) {
        target.parent = null;
      }
    }
  });

  this.addRule('connection.reconnect', function (context: { connection: any; source: any; target: any }) {
    var connection = context.connection,
      source = context.source,
      target = context.target;

    return canConnect(source, target, connection);
  });

  this.addRule('connection.updateWaypoints', function (context: { connection: { type: any } }) {
    return {
      type: context.connection.type,
    };
  });

  this.addRule('shape.resize', function (context: { shape: any; newBounds: any }) {
    var shape = context.shape,
      newBounds = context.newBounds;

    return canResize(shape, newBounds);
  });

  this.addRule('elements.create', function (context: { elements: any; position: any; target: any }) {
    var elements = context.elements,
      position = context.position,
      target = context.target;

    if (isConnection(target) && !canInsert(elements, target, position)) {
      return false;
    }

    return every(elements, function (element: any) {
      if (isConnection(element)) {
        return canConnect(element.source, element.target, element);
      }

      if (element.host) {
        return canAttach(element, element.host, null, position);
      }

      return canCreate(element, target, null, position);
    });
  });

  this.addRule('elements.move', function (context: any) {
    var target = context.target,
      shapes = context.shapes,
      position = context.position;

    return (
      canAttach(shapes, target, null, position) ||
      canReplace(shapes, target, position) ||
      canMove(shapes, target) ||
      canInsert(shapes, target, position)
    );
  });

  this.addRule('shape.create', function (context: any) {
    return canCreate(context.shape, context.target, context.source, context.position);
  });

  this.addRule('shape.attach', function (context: { shape: any; target: any; position: any }) {
    return canAttach(context.shape, context.target, null, context.position);
  });

  this.addRule('element.copy', function (context: { element: any; elements: any }) {
    var element = context.element,
      elements = context.elements;

    return canCopy(elements, element);
  });
};

BpmnRules.prototype.canConnectMessageFlow = canConnectMessageFlow;

BpmnRules.prototype.canConnectSequenceFlow = canConnectSequenceFlow;

BpmnRules.prototype.canConnectDataAssociation = canConnectDataAssociation;

BpmnRules.prototype.canConnectAssociation = canConnectAssociation;

BpmnRules.prototype.canMove = canMove;

BpmnRules.prototype.canAttach = canAttach;

BpmnRules.prototype.canReplace = canReplace;

BpmnRules.prototype.canDrop = canDrop;

BpmnRules.prototype.canInsert = canInsert;

BpmnRules.prototype.canCreate = canCreate;

BpmnRules.prototype.canConnect = canConnect;

BpmnRules.prototype.canResize = canResize;

BpmnRules.prototype.canCopy = canCopy;

/**
 * Utility functions for rule checking
 */

/**
 * Checks if given element can be used for starting connection.
 *
 * @param  {Element} source
 * @return {boolean}
 */
function canStartConnection(element: any) {
  if (nonExistingOrLabel(element)) {
    return null;
  }

  return isAny(element, [
    'bpmn:FlowNode',
    'bpmn:InteractionNode',
    'bpmn:DataObjectReference',
    'bpmn:DataStoreReference',
    'bpmn:Group',
    'bpmn:TextAnnotation',
  ]);
}

function nonExistingOrLabel(element: any) {
  return !element || isLabel(element);
}

function isSame(a: any, b: any) {
  return a === b;
}

function getOrganizationalParent(element: { parent: any }) {
  do {
    if (is(element, 'bpmn:Process')) {
      return getBusinessObject(element);
    }

    if (is(element, 'bpmn:Participant')) {
      return getBusinessObject(element).processRef || getBusinessObject(element);
    }
  } while ((element = element.parent));
}

function isTextAnnotation(element: any) {
  return is(element, 'bpmn:TextAnnotation');
}

function isGroup(element: { labelTarget: any }) {
  return is(element, 'bpmn:Group') && !element.labelTarget;
}

function isCompensationBoundary(element: any) {
  return is(element, 'bpmn:BoundaryEvent') && hasEventDefinition(element, 'bpmn:CompensateEventDefinition');
}

function isForCompensation(e: any) {
  return getBusinessObject(e).isForCompensation;
}

function isSameOrganization(a: any, b: any) {
  var parentA = getOrganizationalParent(a),
    parentB = getOrganizationalParent(b);

  return parentA === parentB;
}

function isMessageFlowSource(element: any) {
  return (
    is(element, 'bpmn:InteractionNode') &&
    !is(element, 'bpmn:BoundaryEvent') &&
    (!is(element, 'bpmn:Event') ||
      (is(element, 'bpmn:ThrowEvent') && hasEventDefinitionOrNone(element, 'bpmn:MessageEventDefinition')))
  );
}

function isMessageFlowTarget(element: any) {
  return (
    is(element, 'bpmn:InteractionNode') &&
    !isForCompensation(element) &&
    (!is(element, 'bpmn:Event') ||
      (is(element, 'bpmn:CatchEvent') && hasEventDefinitionOrNone(element, 'bpmn:MessageEventDefinition'))) &&
    !(is(element, 'bpmn:BoundaryEvent') && !hasEventDefinition(element, 'bpmn:MessageEventDefinition'))
  );
}

function getScopeParent(element: any) {
  var parent = element;

  while ((parent = parent.parent)) {
    if (is(parent, 'bpmn:FlowElementsContainer')) {
      return getBusinessObject(parent);
    }

    if (is(parent, 'bpmn:Participant')) {
      return getBusinessObject(parent).processRef;
    }
  }

  return null;
}

function isSameScope(a: any, b: any) {
  var scopeParentA = getScopeParent(a),
    scopeParentB = getScopeParent(b);

  return scopeParentA === scopeParentB;
}

function hasEventDefinition(element: any, eventDefinition: string) {
  var bo = getBusinessObject(element);

  return !!find(bo.eventDefinitions || [], function (definition: any) {
    return is(definition, eventDefinition);
  });
}

function hasEventDefinitionOrNone(element: any, eventDefinition: string) {
  var bo = getBusinessObject(element);

  return (bo.eventDefinitions || []).every(function (definition: any) {
    return is(definition, eventDefinition);
  });
}

function isSequenceFlowSource(element: any) {
  return (
    is(element, 'bpmn:FlowNode') &&
    !is(element, 'bpmn:EndEvent') &&
    !isEventSubProcess(element) &&
    !(is(element, 'bpmn:IntermediateThrowEvent') && hasEventDefinition(element, 'bpmn:LinkEventDefinition')) &&
    !isCompensationBoundary(element) &&
    !isForCompensation(element)
  );
}

function isSequenceFlowTarget(element: any) {
  // console.log('🚀 ~ file: customRules.ts ~ line 319 ~ isSequenceFlowTarget ~ element', element);
  return (
    is(element, 'bpmn:FlowNode') &&
    !is(element, 'bpmn:StartEvent') &&
    !is(element, 'bpmn:BoundaryEvent') &&
    !isEventSubProcess(element) &&
    !(is(element, 'bpmn:IntermediateCatchEvent') && hasEventDefinition(element, 'bpmn:LinkEventDefinition')) &&
    !isForCompensation(element)
  );
}

function isEventBasedTarget(element: any) {
  return (
    is(element, 'bpmn:ReceiveTask') ||
    (is(element, 'bpmn:IntermediateCatchEvent') &&
      (hasEventDefinition(element, 'bpmn:MessageEventDefinition') ||
        hasEventDefinition(element, 'bpmn:TimerEventDefinition') ||
        hasEventDefinition(element, 'bpmn:ConditionalEventDefinition') ||
        hasEventDefinition(element, 'bpmn:SignalEventDefinition')))
  );
}

function isConnection(element: any) {
  return element.waypoints;
}

function getParents(element: { parent: any }) {
  var parents = [];

  while (element) {
    element = element.parent;

    if (element) {
      parents.push(element);
    }
  }

  return parents;
}

function isParent(possibleParent: any, element: any) {
  var allParents = getParents(element);
  return allParents.indexOf(possibleParent) !== -1;
}

function canConnect(source: any, target: any, connection?: undefined) {
  if (nonExistingOrLabel(source) || nonExistingOrLabel(target)) {
    return null;
  }

  if (!is(connection, 'bpmn:DataAssociation')) {
    if (canConnectMessageFlow(source, target)) {
      return { type: 'bpmn:MessageFlow' };
    }

    if (canConnectSequenceFlow(source, target)) {
      return { type: 'bpmn:SequenceFlow' };
    }
  }

  var connectDataAssociation = canConnectDataAssociation(source, target);

  if (connectDataAssociation) {
    return connectDataAssociation;
  }

  if (isCompensationBoundary(source) && isForCompensation(target)) {
    return {
      type: 'bpmn:Association',
      associationDirection: 'One',
    };
  }

  if (canConnectAssociation(source, target)) {
    return {
      type: 'bpmn:Association',
    };
  }

  return false;
}

/**
 * Can an element be dropped into the target element
 *
 * @return {boolean}
 */
function canDrop(element: any, target: any, position?: undefined) {
  // can move labels and groups everywhere
  if (isLabel(element) || isGroup(element)) {
    return true;
  }

  // disallow to create elements on collapsed pools
  if (is(target, 'bpmn:Participant') && !isExpanded(target)) {
    return false;
  }

  // allow to create new participants on
  // existing collaboration and process diagrams
  if (is(element, 'bpmn:Participant')) {
    return is(target, 'bpmn:Process') || is(target, 'bpmn:Collaboration');
  }

  // allow moving DataInput / DataOutput within its original container only
  if (isAny(element, ['bpmn:DataInput', 'bpmn:DataOutput'])) {
    if (element.parent) {
      return target === element.parent;
    }
  }

  // allow creating lanes on participants and other lanes only
  if (is(element, 'bpmn:Lane')) {
    return is(target, 'bpmn:Participant') || is(target, 'bpmn:Lane');
  }

  // disallow dropping boundary events which cannot replace with intermediate event
  if (is(element, 'bpmn:BoundaryEvent') && !isDroppableBoundaryEvent(element)) {
    return false;
  }

  // drop flow elements onto flow element containers
  // and participants
  if (is(element, 'bpmn:FlowElement') && !is(element, 'bpmn:DataStoreReference')) {
    if (is(target, 'bpmn:FlowElementsContainer')) {
      return isExpanded(target);
    }

    return isAny(target, ['bpmn:Participant', 'bpmn:Lane']);
  }

  // disallow dropping data store reference if there is no process to append to
  if (is(element, 'bpmn:DataStoreReference') && is(target, 'bpmn:Collaboration')) {
    return some(getBusinessObject(target).get('participants'), function (participant: { get: (arg0: string) => any }) {
      return !!participant.get('processRef');
    });
  }

  // account for the fact that data associations are always
  // rendered and moved to top (Process or Collaboration level)
  //
  // artifacts may be placed wherever, too
  if (isAny(element, ['bpmn:Artifact', 'bpmn:DataAssociation', 'bpmn:DataStoreReference'])) {
    return isAny(target, ['bpmn:Collaboration', 'bpmn:Lane', 'bpmn:Participant', 'bpmn:Process', 'bpmn:SubProcess']);
  }

  if (is(element, 'bpmn:MessageFlow')) {
    return is(target, 'bpmn:Collaboration') || element.source.parent == target || element.target.parent == target;
  }

  return false;
}

function isDroppableBoundaryEvent(event: any) {
  return (
    getBusinessObject(event).cancelActivity &&
    (hasNoEventDefinition(event) || hasCommonBoundaryIntermediateEventDefinition(event))
  );
}

function isBoundaryEvent(element: any) {
  return !isLabel(element) && is(element, 'bpmn:BoundaryEvent');
}

function isLane(element: any) {
  return is(element, 'bpmn:Lane');
}

/**
 * We treat IntermediateThrowEvents as boundary events during create,
 * this must be reflected in the rules.
 */
function isBoundaryCandidate(element: any) {
  if (isBoundaryEvent(element)) {
    return true;
  }

  if (is(element, 'bpmn:IntermediateThrowEvent') && hasNoEventDefinition(element)) {
    return true;
  }

  return is(element, 'bpmn:IntermediateCatchEvent') && hasCommonBoundaryIntermediateEventDefinition(element);
}

function hasNoEventDefinition(element: any) {
  var bo = getBusinessObject(element);

  return bo && !(bo.eventDefinitions && bo.eventDefinitions.length);
}

function hasCommonBoundaryIntermediateEventDefinition(element: any) {
  return hasOneOfEventDefinitions(element, [
    'bpmn:MessageEventDefinition',
    'bpmn:TimerEventDefinition',
    'bpmn:SignalEventDefinition',
    'bpmn:ConditionalEventDefinition',
  ]);
}

function hasOneOfEventDefinitions(element: any, eventDefinitions: any[]) {
  return eventDefinitions.some(function (definition: any) {
    return hasEventDefinition(element, definition);
  });
}

function isReceiveTaskAfterEventBasedGateway(element: { incoming: any }) {
  return (
    is(element, 'bpmn:ReceiveTask') &&
    find(element.incoming, function (incoming: { source: any }) {
      return is(incoming.source, 'bpmn:EventBasedGateway');
    })
  );
}

function canAttach(elements: any, target: any, source: any, position: any) {
  if (!Array.isArray(elements)) {
    elements = [elements];
  }

  // only (re-)attach one element at a time
  if (elements.length !== 1) {
    return false;
  }

  var element = elements[0];

  // do not attach labels
  if (isLabel(element)) {
    return false;
  }

  // only handle boundary events
  if (!isBoundaryCandidate(element)) {
    return false;
  }

  // disallow drop on event sub processes
  if (isEventSubProcess(target)) {
    return false;
  }

  // only allow drop on non compensation activities
  if (!is(target, 'bpmn:Activity') || isForCompensation(target)) {
    return false;
  }

  // only attach to subprocess border
  if (position && !isBoundaryAttachment(position, target)) {
    return false;
  }

  // do not attach on receive tasks after event based gateways
  if (isReceiveTaskAfterEventBasedGateway(target)) {
    return false;
  }

  return 'attach';
}

/**
 * Defines how to replace elements for a given target.
 *
 * Returns an array containing all elements which will be replaced.
 *
 * @example
 *
 *  [{ id: 'IntermediateEvent_2',
 *     type: 'bpmn:StartEvent'
 *   },
 *   { id: 'IntermediateEvent_5',
 *     type: 'bpmn:EndEvent'
 *   }]
 *
 * @param  {Array} elements
 * @param  {Object} target
 *
 * @return {Object} an object containing all elements which have to be replaced
 */
function canReplace(elements: any, target: any, position: any) {
  if (!target) {
    return false;
  }

  var canExecute: any = {
    replacements: [],
  };

  forEach(elements, function (element: any) {
    if (!isEventSubProcess(target)) {
      if (is(element, 'bpmn:StartEvent') && element.type !== 'label' && canDrop(element, target)) {
        // replace a non-interrupting start event by a blank interrupting start event
        // when the target is not an event sub process
        if (!isInterrupting(element)) {
          canExecute.replacements.push({
            oldElementId: element.id,
            newElementType: 'bpmn:StartEvent',
          });
        }

        // replace an error/escalation/compensate start event by a blank interrupting start event
        // when the target is not an event sub process
        if (
          hasErrorEventDefinition(element) ||
          hasEscalationEventDefinition(element) ||
          hasCompensateEventDefinition(element)
        ) {
          canExecute.replacements.push({
            oldElementId: element.id,
            newElementType: 'bpmn:StartEvent',
          });
        }

        // replace a typed start event by a blank interrupting start event
        // when the target is a sub process but not an event sub process
        if (
          hasOneOfEventDefinitions(element, [
            'bpmn:MessageEventDefinition',
            'bpmn:TimerEventDefinition',
            'bpmn:SignalEventDefinition',
            'bpmn:ConditionalEventDefinition',
          ]) &&
          is(target, 'bpmn:SubProcess')
        ) {
          canExecute.replacements.push({
            oldElementId: element.id,
            newElementType: 'bpmn:StartEvent',
          });
        }
      }
    }

    if (!is(target, 'bpmn:Transaction')) {
      if (hasEventDefinition(element, 'bpmn:CancelEventDefinition') && element.type !== 'label') {
        if (is(element, 'bpmn:EndEvent') && canDrop(element, target)) {
          canExecute.replacements.push({
            oldElementId: element.id,
            newElementType: 'bpmn:EndEvent',
          });
        }

        if (is(element, 'bpmn:BoundaryEvent') && canAttach(element, target, null, position)) {
          canExecute.replacements.push({
            oldElementId: element.id,
            newElementType: 'bpmn:BoundaryEvent',
          });
        }
      }
    }
  });

  return canExecute.replacements.length ? canExecute : false;
}

function canMove(elements: any, target: any) {
  // do not move selection containing lanes
  if (some(elements, isLane)) {
    return false;
  }

  // allow default move check to start move operation
  if (!target) {
    return true;
  }

  return elements.every(function (element: any) {
    return canDrop(element, target);
  });
}

function canCreate(shape: any, target: any, source: any, position: any) {
  if (!target) {
    return false;
  }

  if (isLabel(shape) || isGroup(shape)) {
    return true;
  }

  if (isSame(source, target)) {
    return false;
  }

  // ensure we do not drop the element
  // into source
  if (source && isParent(source, target)) {
    return false;
  }

  return canDrop(shape, target, position) || canInsert(shape, target, position);
}

function canResize(shape: any, newBounds: { width: number; height: number }) {
  if (is(shape, 'bpmn:SubProcess')) {
    return isExpanded(shape) && (!newBounds || (newBounds.width >= 100 && newBounds.height >= 80));
  }

  if (is(shape, 'bpmn:Lane')) {
    return !newBounds || (newBounds.width >= 130 && newBounds.height >= 60);
  }

  if (is(shape, 'bpmn:Participant')) {
    return !newBounds || (newBounds.width >= 250 && newBounds.height >= 50);
  }

  if (isTextAnnotation(shape)) {
    return true;
  }

  if (isGroup(shape)) {
    return true;
  }

  return false;
}

/**
 * Check, whether one side of the relationship
 * is a text annotation.
 */
function isOneTextAnnotation(source: any, target: any) {
  var sourceTextAnnotation = isTextAnnotation(source),
    targetTextAnnotation = isTextAnnotation(target);

  return (sourceTextAnnotation || targetTextAnnotation) && sourceTextAnnotation !== targetTextAnnotation;
}

function canConnectAssociation(source: any, target: any) {
  // compensation boundary events are exception
  if (isCompensationBoundary(source) && isForCompensation(target)) {
    return true;
  }

  // don't connect parent <-> child
  if (isParent(target, source) || isParent(source, target)) {
    return false;
  }

  // allow connection of associations between <!TextAnnotation> and <TextAnnotation>
  if (isOneTextAnnotation(source, target)) {
    return true;
  }

  // can connect associations where we can connect
  // data associations, too (!)
  return !!canConnectDataAssociation(source, target);
}

function canConnectMessageFlow(source: any, target: any) {
  // during connect user might move mouse out of canvas
  // https://github.com/bpmn-io/bpmn-js/issues/1033
  if (getRootElement(source) && !getRootElement(target)) {
    return false;
  }

  return isMessageFlowSource(source) && isMessageFlowTarget(target) && !isSameOrganization(source, target);
}

function canConnectSequenceFlow(source: any, target: any) {
  // console.log('🚀 ~ file: customRules.ts ~ line 779 ~ canConnectSequenceFlow ~ source', target);
  if (
    isEventBasedTarget(target) &&
    target.incoming.length > 0 &&
    areOutgoingEventBasedGatewayConnections(target.incoming) &&
    !is(source, 'bpmn:EventBasedGateway')
  ) {
    return false;
  }

  return (
    isSequenceFlowSource(source) &&
    isSequenceFlowTarget(target) &&
    isSameScope(source, target) &&
    !(is(source, 'bpmn:EventBasedGateway') && !isEventBasedTarget(target))
  );
}

function canConnectDataAssociation(source: any, target: any) {
  if (
    isAny(source, ['bpmn:DataObjectReference', 'bpmn:DataStoreReference']) &&
    isAny(target, ['bpmn:Activity', 'bpmn:ThrowEvent'])
  ) {
    return { type: 'bpmn:DataInputAssociation' };
  }

  if (
    isAny(target, ['bpmn:DataObjectReference', 'bpmn:DataStoreReference']) &&
    isAny(source, ['bpmn:Activity', 'bpmn:CatchEvent'])
  ) {
    return { type: 'bpmn:DataOutputAssociation' };
  }

  return false;
}

function canInsert(shape: string | any[], flow: { source: any; target: any; parent: any }, position: any) {
  if (!flow) {
    return false;
  }

  if (Array.isArray(shape)) {
    if (shape.length !== 1) {
      return false;
    }

    shape = shape[0];
  }

  if (flow.source === shape || flow.target === shape) {
    return false;
  }

  // return true if we can drop on the
  // underlying flow parent
  //
  // at this point we are not really able to talk
  // about connection rules (yet)

  return (
    isAny(flow, ['bpmn:SequenceFlow', 'bpmn:MessageFlow']) &&
    !isLabel(flow) &&
    is(shape, 'bpmn:FlowNode') &&
    !is(shape, 'bpmn:BoundaryEvent') &&
    canDrop(shape, flow.parent, position)
  );
}

function includes(elements: string | any[], element: any) {
  return elements && element && elements.indexOf(element) !== -1;
}

function canCopy(elements: any, element: { parent: any }) {
  if (isLabel(element)) {
    return true;
  }

  if (is(element, 'bpmn:Lane') && !includes(elements, element.parent)) {
    return false;
  }

  return true;
}

function isOutgoingEventBasedGatewayConnection(connection: { source: any }) {
  // console.log('🚀 ~ file: customRules.ts ~ line 862 ~ isOutgoingEventBasedGatewayConnection ~ connection', connection);
  if (connection && connection.source) {
    return is(connection.source, 'bpmn:EventBasedGateway');
  }
}

function areOutgoingEventBasedGatewayConnections(connections: any[]) {
  connections = connections || [];

  return connections.some(isOutgoingEventBasedGatewayConnection);
}

function getRootElement(element: any) {
  return getParent(element, 'bpmn:Process') || getParent(element, 'bpmn:Collaboration');
}
