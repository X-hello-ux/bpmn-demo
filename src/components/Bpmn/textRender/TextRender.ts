/* eslint-disable spellcheck/spell-checker */
import { assign } from 'min-dash';

import TextUtil from 'diagram-js/lib/util/Text';

var DEFAULT_FONT_SIZE = 15;
var LINE_HEIGHT_RATIO = 1.2;
var MIN_TEXT_ANNOTATION_HEIGHT = 30;

export default function TextRenderer(this: any, config: any) {
  var defaultStyle = assign(
    {
      fontFamily: '微软雅黑',
      fontSize: DEFAULT_FONT_SIZE,
      fontWeight: 'normal',
      lineHeight: LINE_HEIGHT_RATIO,
      fill: 'hsl(999, 10%, 15%)',
    },
    (config && config.defaultStyle) || {},
  );

  var fontSize = parseInt(defaultStyle.fontSize, 10);

  var externalStyle = assign(
    {},
    defaultStyle,
    {
      fontSize,
      fill: 'hsl(999, 10%, 15%)',
    },
    (config && config.externalStyle) || {},
  );

  var textUtil = new TextUtil({
    style: defaultStyle,
  });

  /**
   * Get the new bounds of an externally rendered,
   * layouted label.
   *
   * @param  {Bounds} bounds
   * @param  {string} text
   *
   * @return {Bounds}
   */

  this.getExternalLabelBounds = function (bounds: any, text: string) {
    var layoutedDimensions = textUtil.getDimensions(text, {
      box: {
        width: 90,
        height: 30,
        x: bounds.width / 2 + bounds.x,
        y: bounds.height / 2 + bounds.y,
      },
      style: externalStyle,
    });

    return {
      x: Math.round(bounds.x + bounds.width / 2 - layoutedDimensions.width / 2),
      y: Math.round(bounds.y),
      width: Math.ceil(layoutedDimensions.width),
      height: Math.ceil(layoutedDimensions.height),
    };
  };

  /**
   * Get the new bounds of text annotation.
   *
   * @param  {Bounds} bounds
   * @param  {string} text
   *
   * @return {Bounds}
   */
  this.getTextAnnotationBounds = function (bounds: any, text: string) {
    var layoutedDimensions = textUtil.getDimensions(text, {
      box: bounds,
      style: defaultStyle,
      align: 'right',
      padding: 5,
    });

    return {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: Math.max(MIN_TEXT_ANNOTATION_HEIGHT, Math.round(layoutedDimensions.height)),
    };
  };

  /**
   * Create a layouted text element.
   *
   * @param {string} text
   * @param {Object} [options]
   *
   * @return {SVGElement} rendered text
   */
  this.createText = function (text: string, options: any) {
    options.align = 'center-middle';

    // height为30的节点有 : 开始 结束 判断 这些节点不改变
    // Task类型节点,超出隐藏显示省略号
    if (options.box.height !== 30 && text && text.length >= 3) {
      return textUtil.createText(`\u00A0\u00A0\u00A0\u00A0` + text.slice(0, 3) + '...', options || {});
    } else {
      return textUtil.createText(text, options || {});
    }
  };

  /**
   * Get default text style.
   */
  this.getDefaultStyle = function () {
    return defaultStyle;
  };

  /**
   * Get the external text style.
   */
  this.getExternalStyle = function () {
    return externalStyle;
  };
}

TextRenderer.$inject = ['config.textRenderer'];
