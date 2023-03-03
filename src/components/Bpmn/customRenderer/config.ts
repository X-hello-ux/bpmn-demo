// @ts-nocheck
// palette
import startURL from '../../../assets/bpmnIcon/palette/start.png';
import judgeURL from '../../../assets/bpmnIcon/palette/judge.png';
import endURL from '../../../assets/bpmnIcon/palette/end.png';

// shape
// import approveURL from '../../../assets/bpmnIcon/shape/approve.jpg';
// import waitURL from '../../../assets/bpmnIcon/shape/wait.jpg';
// import branchURL from '../../../assets/bpmnIcon/shape/branch.jpg';
// import mergeURL from '../../../assets/bpmnIcon/shape/merge.jpg';
// import programURL from '../../../assets/bpmnIcon/shape/program.jpg';
// import noticeURL from '../../../assets/bpmnIcon/shape/notice.jpg';
// import refuseURL from '../../../assets/bpmnIcon/shape/refuse.jpg';
import {
  // startURL,
  approveURL,
  // judgeURL,
  waitURL,
  branchURL,
  mergeURL,
  programURL,
  noticeURL,
  refuseURL,
  // endURL,
} from '../../../assets/bpmnIcon/shape';

// 元素的类型
const customElements = [
  'bpmn:StartEvent',
  'bpmn:UserTask',
  'bpmn:ExclusiveGateway',
  'bpmn:Task',
  'bpmn:ManualTask',
  'bpmn:ScriptTask',
  'bpmn:ServiceTask',
  'bpmn:ReceiveTask',
  'bpmn:BusinessRuleTask',
  'bpmn:EndEvent',
];

const CIRCLENumber = 36; // 开始  结束节点长和宽
const RHOMBUSNumber = 50; // 判断节点长和宽
const TASKSTYLE = {
  width: 140,
  height: 60,
};

const customConfig: any = {
  'bpmn:StartEvent': {
    nodeAttrs: {
      width: CIRCLENumber,
      height: CIRCLENumber,
      url: startURL,
    },
  },
  'bpmn:UserTask': {
    nodeAttrs: {
      width: TASKSTYLE.width,
      height: TASKSTYLE.height,
      url: approveURL,
    },
  },
  'bpmn:ExclusiveGateway': {
    nodeAttrs: {
      width: RHOMBUSNumber,
      height: RHOMBUSNumber,
      url: judgeURL,
    },
  },
  'bpmn:Task': {
    nodeAttrs: {
      width: TASKSTYLE.width,
      height: TASKSTYLE.height,
      url: waitURL,
    },
  },
  'bpmn:ScriptTask': {
    nodeAttrs: {
      width: TASKSTYLE.width,
      height: TASKSTYLE.height,
      url: mergeURL,
    },
  },
  'bpmn:ServiceTask': {
    nodeAttrs: {
      width: TASKSTYLE.width,
      height: TASKSTYLE.height,
      url: programURL,
    },
  },
  'bpmn:ReceiveTask': {
    nodeAttrs: {
      width: TASKSTYLE.width,
      height: TASKSTYLE.height,
      url: noticeURL,
    },
  },
  'bpmn:ManualTask': {
    nodeAttrs: {
      width: TASKSTYLE.width,
      height: TASKSTYLE.height,
      url: branchURL,
    },
  },
  'bpmn:BusinessRuleTask': {
    nodeAttrs: {
      width: TASKSTYLE.width,
      height: TASKSTYLE.height,
      url: refuseURL,
    },
  },
  'bpmn:EndEvent': {
    nodeAttrs: {
      width: CIRCLENumber,
      height: CIRCLENumber,
      url: endURL,
    },
  },
};

export { customElements, customConfig };
