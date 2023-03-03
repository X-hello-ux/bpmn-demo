// @ts-nocheck
// 自定义左侧工具栏

import startURL from '../../../assets/bpmnIcon/palette/start.png';
import approveURL from '../../../assets/bpmnIcon/palette/approve.png';
import judgeURL from '../../../assets/bpmnIcon/palette/judge.png';
import branchURL from '../../../assets/bpmnIcon/palette/branch.png';
import mergeURL from '../../../assets/bpmnIcon/palette/merge.png';
import noticeURL from '../../../assets/bpmnIcon/palette/notice.png';
import refuseURL from '../../../assets/bpmnIcon/palette/refuse.png';
import endURL from '../../../assets/bpmnIcon/palette/end.png';
import programURL from '../../../assets/bpmnIcon/palette/program.png';
import waitURL from '../../../assets/bpmnIcon/palette/wait.png';

export default function PaletteProvider(
  this: any,
  palette: any,
  create: any,
  elementFactory: any,
  handTool: any,
  lassoTool: any,
  spaceTool: any,
  globalConnect: any,
  translate: any,
) {
  this.create = create;
  this.elementFactory = elementFactory;
  this.handTool = handTool;
  this.lassoTool = lassoTool;
  this.spaceTool = spaceTool;
  this.globalConnect = globalConnect;
  this.translate = translate;
  palette.registerProvider(this);
}

PaletteProvider.$inject = [
  'palette',
  'create',
  'elementFactory',
  'handTool',
  'lassoTool',
  'spaceTool',
  'globalConnect',
  'translate',
];

PaletteProvider.prototype.getPaletteEntries = function () {
  const { create, elementFactory, lassoTool, translate } = this;

  function createAction(arg: any) {
    let { type, group, className, title, imageUrl } = arg;
    function startCreate(event: any) {
      const shape = elementFactory.create('shape', { type });
      create.start(event, shape);
    }
    return {
      group,
      title,
      type,
      className,
      imageUrl,
      action: {
        dragstart: startCreate,
        click: startCreate,
      },
    };
  }

  return {
    'lasso-tool': {
      group: 'tools',
      className: 'iconfont icon-lasso',
      title: translate('激活套索工具'),
      action: {
        click: function (event: EventTarget) {
          lassoTool.activateSelection(event);
        },
      },
    },
    'create.start-event': createAction({
      type: 'bpmn:StartEvent',
      group: 'start',
      // className: 'bpmn-icon-start-event-none',
      className: 'start',
      imageUrl: startURL,
      title: '创建开始事件',
    }),
    'create.user-task': createAction({
      type: 'bpmn:UserTask',
      group: 'approve',
      // className: 'bpmn-icon-user-task',
      className: 'approve',
      imageUrl: approveURL,
      title: '创建审批任务',
    }),
    'create.exclusive-gateway': createAction({
      type: 'bpmn:ExclusiveGateway',
      group: 'judge',
      // className: 'bpmn-icon-gateway-xor',
      className: 'judge',
      imageUrl: judgeURL,
      title: '创建判断事件',
    }),
    // 'create.task': createAction({
    //   type: 'bpmn:Task',
    //   group: 'waiting',
    //   title: '创建等待任务',
    //   // className: 'bpmn-icon-task',
    //   className: 'wait',
    //   imageUrl: waitURL,
    // }),
    'create.manual-task': createAction({
      type: 'bpmn:ManualTask',
      group: 'branch',
      // className: 'bpmn-icon-manual-task',
      className: 'branch',
      imageUrl: branchURL,
      title: '创建分支任务',
    }),
    'create.script-task': createAction({
      type: 'bpmn:ScriptTask',
      group: 'merge',
      // className: 'bpmn-icon-script-task',
      className: 'merge',
      imageUrl: mergeURL,
      title: '创建合并任务',
    }),
    // 'create.service-task': createAction({
    //   type: 'bpmn:ServiceTask',
    //   group: 'program',
    //   // className: 'bpmn-icon-service-task',
    //   className: 'program',
    //   imageUrl: programURL,
    //   title: '创建程序任务',
    // }),
    'create.receive-task': createAction({
      type: 'bpmn:ReceiveTask',
      group: 'notice',
      // className: 'bpmn-icon-receive-task',
      className: 'notice',
      imageUrl: noticeURL,
      title: '创建通知任务',
    }),
    'create.business-rule-task': createAction({
      type: 'bpmn:BusinessRuleTask',
      group: 'refuse',
      // className: 'bpmn-icon-business-rule-task',
      className: 'refuse',
      imageUrl: refuseURL,
      title: '创建拒绝任务',
    }),
    'create.end-event': createAction({
      type: 'bpmn:EndEvent',
      group: 'end',
      // className: 'bpmn-icon-end-event-none',
      className: 'end',
      imageUrl: endURL,
      title: '创建结束事件',
    }),
  };
};
