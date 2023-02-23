// 用于自定义节点宽高,自动适应仪准线
import ElementFactory from 'bpmn-js/lib/features/modeling/ElementFactory';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

class CustomElementFactory extends ElementFactory {
  _config: any;
  constructor(config: any, bpmnFactory: any, moddle: any, translate: any) {
    super(bpmnFactory, moddle, translate);
    this._config = config;
  }

  getDefaultSize(element: any, di: any) {
    const bo = getBusinessObject(element);
    const types: string[] = Object.keys(this._config || {});
    for (const type of types) {
      if (is(bo, type)) {
        return this._config![type];
      }
    }
    return super.getDefaultSize(element, di);
  }
}

// @ts-ignore
CustomElementFactory.$inject = ['config.elementFactory', 'bpmnFactory', 'moddle', 'translate'];
// @ts-ignore
ElementFactory.$inject = ['bpmnFactory', 'moddle', 'translate'];

export default {
  elementFactory: ['type', CustomElementFactory],
};
