import CustomPalette from './customPalette/CustomPalette';
import CustomRenderer from './customRenderer/CustomRenderer';
import CustomContextPadProvider from './customContextPad/CustomContextPadProvider';
import PathMap from './pathMap/pathMap';
import TextRenderer from './textRender/TextRender';
import CustomRules from './customRules/CustomRules';

export default {
  __init__: ['paletteProvider', 'customRenderer', 'contextPadProvider', 'bpmnRules'],
  paletteProvider: ['type', CustomPalette],
  customRenderer: ['type', CustomRenderer],
  contextPadProvider: ['type', CustomContextPadProvider],
  pathMap: ['type', PathMap],
  textRenderer: ['type', TextRenderer],
  bpmnRules: ['type', CustomRules],
};
