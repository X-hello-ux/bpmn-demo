import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import { append as svgAppend, attr as svgAttr, create as svgCreate, remove as svgRemove } from 'tiny-svg';
import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';
import { customElements, customConfig } from './config';
export default class CustomRenderer extends BaseRenderer {
  constructor(eventBus: any, bpmnRenderer: any, styles: any, pathMap: any) {
    super(eventBus, 1500);
    this.bpmnRenderer = bpmnRenderer;
    this.pathMap = pathMap;
  }

  canRender = (element: any) => isAny(element, customElements) && !element.labelTarget;

  drawShape(parentNode: any, element: any) {
    const type = element.type;
    const shape = this.bpmnRenderer.drawShape(parentNode, element);
    if (customElements.includes(type)) {
      const { nodeAttrs } = customConfig[type];
      const rect = drawRect(parentNode, nodeAttrs);
      prependTo(rect, parentNode);
      svgRemove(shape);
      return shape;
    }
  }
}

function drawRect(parentNode: any, { width, height, url }: any) {
  if (url) {
    const rect: any = svgCreate('image', {
      width,
      height,
      href: url,
    });
    svgAppend(parentNode, rect);
    return rect;
  }
}

function prependTo(newNode: any, parentNode: any, siblingNode?: any) {
  const node = siblingNode || parentNode.firstChild;
  if (newNode === node) return;
  parentNode.insertBefore(newNode, node);
}

CustomRenderer.$inject = ['eventBus', 'bpmnRenderer', 'styles', 'pathMap'];
