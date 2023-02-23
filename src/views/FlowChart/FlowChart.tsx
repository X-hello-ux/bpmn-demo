import React, { useEffect, useRef, useState } from 'react';
import FlowChartStyle from './FlowChart.module.less';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import CustomBpmnMode from '../../components/Bpmn';
import ElementFactory from '../../components/Bpmn/customElementFactory';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import { xmlStr } from './mock/XmlStr';
import MyButton from './components/Buttons';

export default function FlowChat() {
  const bpmnModeler: React.MutableRefObject<any | HTMLDivElement> = useRef();
  const chartContainerRef: React.MutableRefObject<any | HTMLDivElement> = useRef();

  function init() {
    bpmnModeler.current = new BpmnModeler({
      container: chartContainerRef.current,
      additionalModules: [
        CustomBpmnMode,
        ElementFactory, // 定义节点宽高,自适应仪准线
        {
          labelEditingProvider: ['value', ''], //禁用节点编辑
          autoScroll: ['value', false], // 禁用鼠标焦点移动到画布边框位置时开启画布滚动
          zoomScroll: ['value', ''], // 禁用滚轮滚动
        },
      ],
      elementFactory: { 'bpmn:Task': { width: 140, height: 58 } },
    });
    createNewDiagram();
  }

  useEffect(() => init(), []);

  // 建模
  const createNewDiagram = async (): Promise<void> => {
    try {
      await bpmnModeler.current.importXML(xmlStr); // 导入xml 创建流程图
      addEventBusListener();
    } catch (err) {
      throw err;
    }
  };

  // 添加事件
  const addEventBusListener = (): void => {
    const eventBus = bpmnModeler.current.get('eventBus');
    const eventList = [
      'element.click',
      'commandStack.shape.create.postExecuted',
      'interactionEvents.updateHit',
      'shape.remove',
    ];
    eventList.forEach((item: string) => eventBus.on(item, (e: Event) => elementEvent(e)));
  };

  const elementEvent = ({ element, type, context }: any): void => {
    if (type === 'commandStack.shape.create.postExecuted') {
      // 创建元素后的事件
      const { shape } = context;
      shape.type !== 'bpmn:Process' && initNodeName(shape);
    }
  };

  // 创建元素后默认赋值一个name
  const initNodeName = (shape: any) => {
    if (shape.type === 'bpmn:StartEvent') {
      setNodeName(shape, '开始');
    } else if (shape.type === 'bpmn:UserTask') {
      setNodeName(shape, '审批');
    } else if (shape.type === 'bpmn:ExclusiveGateway') {
      setNodeName(shape, '判断');
    } else if (shape.type === 'bpmn:Task') {
      setNodeName(shape, '等待');
    } else if (shape.type === 'bpmn:ManualTask') {
      setNodeName(shape, '分支');
    } else if (shape.type === 'bpmn:ScriptTask') {
      setNodeName(shape, '合并');
    } else if (shape.type === 'bpmn:ServiceTask') {
      setNodeName(shape, '程序');
    } else if (shape.type === 'bpmn:BusinessRuleTask') {
      setNodeName(shape, '拒绝');
    } else if (shape.type === 'bpmn:ReceiveTask') {
      setNodeName(shape, '通知');
    } else if (shape.type === 'bpmn:EndEvent') {
      setNodeName(shape, '结束');
    }
  };

  // 创建元素时默认赋一个name
  const setNodeName = (shape: any, name: string) => {
    const modeling = bpmnModeler.current.get('modeling');
    modeling.updateProperties(shape, { name });
  };

  return (
    <div className={FlowChartStyle.chart}>
      <MyButton bpmnModeler={bpmnModeler} />
      <div className={FlowChartStyle.chartContainer} ref={chartContainerRef} />
    </div>
  );
}
