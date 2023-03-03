// @ts-nocheck
import { assign, forEach, isArray } from 'min-dash';
import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';
import { hasPrimaryModifier } from 'diagram-js/lib/util/Mouse';

export default function ContextPadProvider(
  this: any,
  config: { autoPlace?: any },
  injector: { get: (arg0: string, arg1: boolean) => any },
  eventBus: { on: (arg0: string, arg1: number, arg2: (event: any) => void) => void },
  contextPad: { registerProvider: (arg0: any) => void; isOpen: (arg0: any) => any; getEntries: (arg0: any) => any },
  modeling: any,
  elementFactory: any,
  connect: any,
  create: any,
  popupMenu: any,
  canvas: any,
  rules: any,
  translate: any,
  elementRegistry: any,
) {
  config = config || {};

  contextPad.registerProvider(this);

  this._contextPad = contextPad;
  this._modeling = modeling;
  this._elementFactory = elementFactory;
  this._connect = connect;
  this._create = create;
  this._popupMenu = popupMenu;
  this._canvas = canvas;
  this._rules = rules;
  this._translate = translate;

  if (config.autoPlace !== false) {
    this._autoPlace = injector.get('autoPlace', false);
  }

  eventBus.on('create.end', 250, function (event: { context: any }) {
    let context = event.context,
      shape = context.shape;

    if (!hasPrimaryModifier(event) || !contextPad.isOpen(shape)) {
      return;
    }

    let entries = contextPad.getEntries(shape);

    if (entries.replace) {
      entries.replace.action.click(event, shape);
    }
  });
}

ContextPadProvider.$inject = [
  'config.contextPad',
  'injector',
  'eventBus',
  'contextPad',
  'modeling',
  'elementFactory',
  'connect',
  'create',
  'popupMenu',
  'canvas',
  'rules',
  'translate',
  'elementRegistry',
];

ContextPadProvider.prototype.getContextPadEntries = function (element: { type: string; businessObject: any }) {
  let contextPad = this._contextPad,
    modeling = this._modeling,
    elementFactory = this._elementFactory,
    connect = this._connect,
    create = this._create,
    popupMenu = this._popupMenu,
    canvas = this._canvas,
    rules = this._rules,
    autoPlace = this._autoPlace,
    translate = this._translate,
    elementRegistry = this._elementRegistry;
  let actions = {};

  if (element.type === 'label') {
    return actions;
  }

  const businessObject = element.businessObject;

  function startConnect(event: any, element: any) {
    connect.start(event, element);
  }

  //   删除节点;
  function removeElement() {
    modeling.removeElements([element]);
  }

  if (
    isAny(businessObject, [
      'bpmn:FlowNode',
      'bpmn:InteractionNode',
      'bpmn:DataObjectReference',
      'bpmn:DataStoreReference',
    ])
  ) {
    assign(actions, {
      connect: {
        group: 'edit',
        className: 'bpmn-icon-connection-multi',
        title: translate(
          'Connect using ' + (businessObject.isForCompensation ? '' : 'Sequence/MessageFlow or ') + 'Association',
        ),
        action: {
          click: startConnect,
          dragstart: startConnect,
        },
      },
    });
  }

  // delete element entry, only show if allowed by rules
  let deleteAllowed = rules.allowed('elements.delete', {
    elements: [element],
  });

  if (isArray(deleteAllowed)) {
    // was the element returned as a deletion candidate?
    deleteAllowed = deleteAllowed[0] === element;
  }

  if (deleteAllowed) {
    assign(actions, {
      delete: {
        group: 'edit',
        className: 'bpmn-icon-trash',
        title: translate('Remove'),
        action: {
          click: removeElement,
        },
      },
    });
  }
  return actions;
};
