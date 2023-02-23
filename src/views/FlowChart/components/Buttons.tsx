// 流程图上方的buttons
import React, { useState, ReactElement } from 'react';
import { Button, Space, Tooltip } from 'antd';
import {
  ClearOutlined,
  RollbackOutlined,
  ReconciliationOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import { xmlStr } from '../mock/XmlStr';
import FlowChartStyle from '../FlowChart.module.less';
interface IProps {
  bpmnModeler: any;
}

interface IButtons {
  title: string;
  icon?: ReactElement;
  onclick: () => void;
  text: string;
}

export default function MyButton({ bpmnModeler }: IProps) {
  const [scale, setScale] = useState(0.8);

  // 放大 缩小 还原大小
  const handlerZoom = (value?: number): void => {
    const newScale = !value ? 0.8 : scale + value;
    bpmnModeler.current.get('canvas').zoom(newScale);
    setScale(newScale);
  };

  const buttons: IButtons[] = [
    {
      title: '清空',
      icon: <ClearOutlined />,
      onclick: () => {
        bpmnModeler.current.importXML(xmlStr);
      },
      text: '清空',
    },
    {
      title: '撤销上一步',
      icon: <RollbackOutlined />,
      onclick: () => bpmnModeler.current.get('commandStack').undo(),
      text: '撤销上一步',
    },
    {
      title: '恢复上一步',
      icon: <ReconciliationOutlined />,
      onclick: () => bpmnModeler.current.get('commandStack').redo(),
      text: '恢复上一步',
    },
    {
      title: '放大',
      icon: <ZoomInOutlined />,
      onclick: () => handlerZoom(0.1),
      text: '放大',
    },
    {
      title: '缩小',
      icon: <ZoomOutOutlined />,
      onclick: () => handlerZoom(-0.1),
      text: '缩小',
    },
    {
      title: '还原缩放',
      icon: <RedoOutlined />,
      onclick: () => handlerZoom(),
      text: '还原缩放',
    },
  ];

  return (
    <Space className={FlowChartStyle.buttons}>
      {buttons.map((item: IButtons) => (
        <Tooltip title={item.title} key={item.title}>
          <Button onClick={item.onclick} icon={item.icon} style={{ fontSize: 12 }}>
            {item.text}
          </Button>
        </Tooltip>
      ))}
    </Space>
  );
}
