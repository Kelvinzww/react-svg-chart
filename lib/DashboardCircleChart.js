'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _filter2 = require('lodash/filter');

var _filter3 = _interopRequireDefault(_filter2);

var _partial2 = require('lodash/partial');

var _partial3 = _interopRequireDefault(_partial2);

var _map2 = require('lodash/map');

var _map3 = _interopRequireDefault(_map2);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _utils = require('../helpers/utils.js');

var _utils2 = _interopRequireDefault(_utils);

require('../style/chart.less');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

if (module.hot) {
	module.hot.accept('../style/chart.less', function () {
		require('../style/chart.less');
	});
}

var ANGEL = 40,
    //起始角度
VIEWBOX_SIZE = 300,
    //视图大小
ARC_R = 130,
    //外圆弧半径
SCALE_SIZE = 0.5,
    //刻度占圆环比例
ARC_ROUND_DISTANCE = 10,
    //圆弧与圆环的距离
ANNULUS_WIDTH = 0.072,
    //圆环默认宽度
SVG_NS = 'http://www.w3.org/2000/svg',
    XLINK_NS = 'http://www.w3.org/1999/xlink',
    FRAME_NUMBER = 60; //假设浏览器每秒60祯


var EasiCircleChart = function (_React$Component) {
	_inherits(EasiCircleChart, _React$Component);

	function EasiCircleChart(props) {
		_classCallCheck(this, EasiCircleChart);

		var _this = _possibleConstructorReturn(this, (EasiCircleChart.__proto__ || Object.getPrototypeOf(EasiCircleChart)).call(this, props));

		_this.defineLinearGradient = _this.defineLinearGradient.bind(_this);
		_this.drawArc = _this.drawArc.bind(_this);
		_this.move = _this.move.bind(_this);
		_this.drawContent = _this.drawContent.bind(_this);
		_this.getPoints = _this.getPoints.bind(_this);

		//由于多组件复用，会导致id冲突，因此使用uuid生成唯一标示的id
		_this.gradientIdPre = _utils2.default.generateUUID();
		_this.gradientIdSuf = _utils2.default.generateUUID();
		_this.filterId = _utils2.default.generateUUID();
		_this.scaleId = _utils2.default.generateUUID();
		return _this;
	}

	/**
  * 定义渐变色
  * @return {[type]} [description]
  */


	_createClass(EasiCircleChart, [{
		key: 'defineLinearGradient',
		value: function defineLinearGradient() {
			var _props$colors = this.props.colors,
			    colors = _props$colors === undefined ? ['#B78BEE', '#1790DC'] : _props$colors;

			var percent = 100 / colors.length;
			var preColors = (0, _filter3.default)(colors, function (item, key) {
				return key <= Math.ceil(colors.length / 2);
			}),
			    sufColors = colors.length === 1 ? colors : (0, _filter3.default)(colors, function (item, key) {
				return key >= Math.ceil(colors.length / 2);
			});
			console.log(preColors, sufColors);
			return _react2.default.createElement(
				'g',
				null,
				_react2.default.createElement(
					'linearGradient',
					{ id: this.gradientIdPre, x1: '1', y1: '1', x2: '2', y2: '0' },
					(0, _map3.default)(preColors, function (item, index) {
						return _react2.default.createElement('stop', { key: item, offset: index * percent + '%', style: { stopColor: item } });
					})
				),
				_react2.default.createElement(
					'linearGradient',
					{ id: this.gradientIdSuf, x1: '1', y1: '0', x2: '2', y2: '1' },
					(0, _map3.default)(sufColors, function (item, index) {
						return _react2.default.createElement('stop', { key: item, offset: index * percent + '%', style: { stopColor: item } });
					})
				)
			);
		}

		/**
   * 画外圆弧
   * @return {[type]} [description]
   */

	}, {
		key: 'drawArc',
		value: function drawArc() {
			var _props = this.props,
			    _props$colors2 = _props.colors,
			    colors = _props$colors2 === undefined ? ['#B78BEE', '#1790DC'] : _props$colors2,
			    _props$annulusWidth = _props.annulusWidth,
			    annulusWidth = _props$annulusWidth === undefined ? ANNULUS_WIDTH : _props$annulusWidth,
			    _props$beginAngel = _props.beginAngel,
			    beginAngel = _props$beginAngel === undefined ? ANGEL : _props$beginAngel;

			var pointColor = colors[0],
			    a = 0.4; //透明度
			var r = 0,
			    g = 0,
			    b = 0;
			if (/^#\w{6}$/.test(pointColor)) {
				r = parseInt(pointColor.substr(1, 2), 16);
				g = parseInt(pointColor.substr(3, 2), 16);
				b = parseInt(pointColor.substr(5, 2), 16);
			}
			r = r === 0 ? 0 : r / 255;
			g = g === 0 ? 0 : g / 255;
			b = b === 0 ? 0 : b / 255;

			var _getPoints = this.getPoints(),
			    start = _getPoints.start;

			return _react2.default.createElement(
				'g',
				null,
				_react2.default.createElement(
					'defs',
					null,
					_react2.default.createElement(
						'filter',
						{ id: this.filterId, x: '-1', y: '-1', width: '60', height: '60' },
						_react2.default.createElement('feOffset', { result: 'offOut', 'in': 'SourceGraphic', dx: '0', dy: '0' }),
						_react2.default.createElement('feColorMatrix', { result: 'matrixOut', 'in': 'offOut', type: 'matrix',
							values: r + ' 0 0 0 0 0 ' + g + ' 0 0 0 0 0 ' + b + ' 0 0 0 0 0 0.4 0' }),
						_react2.default.createElement('feGaussianBlur', { result: 'blurOut', 'in': 'matrixOut', stdDeviation: '2' }),
						_react2.default.createElement('feBlend', { 'in': 'SourceGraphic', in2: 'blurOut', mode: 'normal' })
					)
				),
				_react2.default.createElement('path', { ref: 'arc-pre',
					stroke: 'url(#' + this.gradientIdPre + ')',
					strokeWidth: VIEWBOX_SIZE * annulusWidth,
					fill: 'none' }),
				_react2.default.createElement('circle', { fill: colors[0], cx: start.x, cy: start.y, r: VIEWBOX_SIZE * annulusWidth / 2 }),
				_react2.default.createElement('circle', { ref: 'end-circle', fill: colors[colors.length - 1], cx: -10, cy: -10, r: VIEWBOX_SIZE * annulusWidth / 2 }),
				_react2.default.createElement('path', { ref: 'arc-suf',
					stroke: 'url(#' + this.gradientIdSuf + ')',
					strokeWidth: VIEWBOX_SIZE * annulusWidth,
					fill: 'none' })
			);
		}
	}, {
		key: 'componentDidMount',
		value: function componentDidMount() {
			var _props2 = this.props,
			    value = _props2.value,
			    _props2$max = _props2.max,
			    max = _props2$max === undefined ? 100 : _props2$max,
			    _props2$animationTime = _props2.animationTime,
			    animationTime = _props2$animationTime === undefined ? 1000 : _props2$animationTime;

			this.elArcPre = (0, _reactDom.findDOMNode)(this.refs['arc-pre']);
			this.elArcSuf = (0, _reactDom.findDOMNode)(this.refs['arc-suf']);
			this.elFullCircle = (0, _reactDom.findDOMNode)(this.refs['full-circle']);
			this.elEndCircle = (0, _reactDom.findDOMNode)(this.refs['end-circle']);
			if (value <= max) {
				this.move(0, Math.ceil(value), 1000 * Math.ceil(value) / (FRAME_NUMBER * animationTime));
			}
		}
	}, {
		key: 'componentWillReceiveProps',
		value: function componentWillReceiveProps(nextProps) {
			var prev = Math.ceil(this.props.value),
			    next = Math.ceil(nextProps.value);
			var _nextProps$animationT = nextProps.animationTime,
			    animationTime = _nextProps$animationT === undefined ? 1000 : _nextProps$animationT,
			    _nextProps$max = nextProps.max,
			    max = _nextProps$max === undefined ? 100 : _nextProps$max;

			if (nextProps.value <= max && nextProps.value !== this.props.value) {
				this.move(prev, next, 1000 * Math.abs(next - prev) / (FRAME_NUMBER * animationTime));
			}
		}

		/**
   * 动起来
   * @param  {[type]}   prev  [description]
   * @param  {Function} next  [description]
   * @param  {Number}   speed [description]
   * @return {[type]}         [description]
   */

	}, {
		key: 'move',
		value: function move(prev, next) {
			var speed = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
			var _props3 = this.props,
			    _props3$beginAngel = _props3.beginAngel,
			    beginAngel = _props3$beginAngel === undefined ? ANGEL : _props3$beginAngel,
			    _props3$max = _props3.max,
			    max = _props3$max === undefined ? 100 : _props3$max;

			var _getPoints2 = this.getPoints(),
			    start = _getPoints2.start,
			    middle = _getPoints2.middle;

			var endAngel = beginAngel + prev / max * (360 - beginAngel * 2);
			var end = {
				x: VIEWBOX_SIZE / 2 - Math.sin(endAngel * Math.PI / 180) * ARC_R,
				y: VIEWBOX_SIZE / 2 + Math.sin((90 - endAngel) * Math.PI / 180) * ARC_R
			};
			var nextPrev = 0;
			if (prev * 2 <= max) {
				this.elArcPre.setAttribute('d', 'M' + start.x + ' ' + start.y + ' A ' + ARC_R + ' ' + ARC_R + ' 0 0 1 ' + end.x + ' ' + end.y);
			} else {
				this.elArcPre.setAttribute('d', 'M' + start.x + ' ' + start.y + ' A ' + ARC_R + ' ' + ARC_R + ' 0 0 1 ' + middle.x + ' ' + middle.y);
				this.elArcSuf.setAttribute('d', 'M' + middle.x + ' ' + middle.y + ' A ' + ARC_R + ' ' + ARC_R + ' 0 0 1 ' + end.x + ' ' + end.y);
			}

			this.elEndCircle.setAttribute('cy', end.y);
			this.elEndCircle.setAttribute('cx', end.x);

			if (prev < next) {
				nextPrev = prev + speed > next ? next : prev + speed;
				window.requestAnimationFrame((0, _partial3.default)(this.move, nextPrev, next, speed));
			} else if (prev > next) {
				nextPrev = prev - speed < next ? next : prev - speed;
				window.requestAnimationFrame((0, _partial3.default)(this.move, nextPrev, next, speed));
			}
		}

		/**
   * 获取关键的节点，起点中点和终点
   * @return {[type]} [description]
   */

	}, {
		key: 'getPoints',
		value: function getPoints() {
			var _props$beginAngel2 = this.props.beginAngel,
			    beginAngel = _props$beginAngel2 === undefined ? ANGEL : _props$beginAngel2;


			var endAngel = 360 - beginAngel;
			var start = {
				x: VIEWBOX_SIZE / 2 - Math.sin(beginAngel * Math.PI / 180) * ARC_R,
				y: VIEWBOX_SIZE / 2 + Math.sin((90 - beginAngel) * Math.PI / 180) * ARC_R
			},
			    end = {
				x: VIEWBOX_SIZE / 2 - Math.sin(endAngel * Math.PI / 180) * ARC_R,
				y: VIEWBOX_SIZE / 2 + Math.sin((90 - endAngel) * Math.PI / 180) * ARC_R
			},
			    middle = {
				x: VIEWBOX_SIZE / 2 - Math.sin(Math.PI) * ARC_R,
				y: VIEWBOX_SIZE / 2 + Math.sin(270 * Math.PI / 180) * ARC_R
			};
			return { start: start, end: end, middle: middle };
		}

		/**
   * 画那个圆
   * @return {[type]} [description]
   */

	}, {
		key: 'drawCircle',
		value: function drawCircle() {
			var _props4 = this.props,
			    _props4$annulusWidth = _props4.annulusWidth,
			    annulusWidth = _props4$annulusWidth === undefined ? ANNULUS_WIDTH : _props4$annulusWidth,
			    _props4$lineColor = _props4.lineColor,
			    lineColor = _props4$lineColor === undefined ? '#e7f0ff' : _props4$lineColor,
			    _props4$bgColor = _props4.bgColor,
			    bgColor = _props4$bgColor === undefined ? '#f8fafe' : _props4$bgColor,
			    _props4$beginAngel = _props4.beginAngel,
			    beginAngel = _props4$beginAngel === undefined ? ANGEL : _props4$beginAngel;

			var anWidth = VIEWBOX_SIZE * annulusWidth; //圆弧宽度
			var endAngel = 360 - beginAngel;

			var _getPoints3 = this.getPoints(),
			    start = _getPoints3.start,
			    end = _getPoints3.end;

			return _react2.default.createElement(
				'g',
				null,
				_react2.default.createElement('path', { d: 'M' + start.x + ' ' + start.y + ' A ' + ARC_R + ' ' + ARC_R + ' 0 1 1 ' + end.x + ' ' + end.y,
					fill: 'none',
					stroke: lineColor,
					strokeWidth: VIEWBOX_SIZE * annulusWidth,
					strokeLinecap: 'round' })
			);
		}

		/**
   * 中间的文字部分
   * @return {[type]} [description]
   */

	}, {
		key: 'drawContent',
		value: function drawContent() {
			var _props5 = this.props,
			    _props5$value = _props5.value,
			    value = _props5$value === undefined ? 70 : _props5$value,
			    _props5$max = _props5.max,
			    max = _props5$max === undefined ? 100 : _props5$max,
			    _props5$title = _props5.title,
			    title = _props5$title === undefined ? '使用率(%)' : _props5$title,
			    _props5$colors = _props5.colors,
			    colors = _props5$colors === undefined ? ['#B78BEE', '#1790DC'] : _props5$colors,
			    _props5$isScaleVisibl = _props5.isScaleVisible,
			    isScaleVisible = _props5$isScaleVisibl === undefined ? false : _props5$isScaleVisibl;

			var length = (value + '').replace(/\./, '').length;
			var fontSize = length === 1 ? 100 : 230 / length + 'px';

			var _getPoints4 = this.getPoints(),
			    start = _getPoints4.start,
			    end = _getPoints4.end;

			return _react2.default.createElement(
				'g',
				null,
				_react2.default.createElement(
					'text',
					{ x: '50%', y: '47%',
						style: { fontSize: fontSize },
						className: 'text-value',
						fill: '' + colors[colors.length - 1] },
					value > max ? max : value
				),
				_react2.default.createElement(
					'text',
					{ x: '50%', y: '70%',
						className: 'text-title',
						style: { fontSize: '24px' },
						fill: '#9C9C9C' },
					title
				),
				isScaleVisible && [_react2.default.createElement(
					'text',
					{ x: start.x + 3, y: start.y + 30,
						className: 'text-scale' },
					'0'
				), _react2.default.createElement(
					'text',
					{ x: end.x, y: end.y + 30,
						className: 'text-scale' },
					max
				)]
			);
		}
	}, {
		key: 'render',
		value: function render() {
			return _react2.default.createElement(
				'svg',
				{ xmlns: SVG_NS,
					xmlnsXlink: XLINK_NS,
					width: '100%', height: '100%',
					className: 'circel-chart-svg',
					viewBox: '0 0 ' + VIEWBOX_SIZE + ' ' + VIEWBOX_SIZE
				},
				_react2.default.createElement(
					'defs',
					null,
					this.defineLinearGradient()
				),
				this.drawCircle(),
				this.drawArc(),
				this.drawContent()
			);
		}
	}]);

	return EasiCircleChart;
}(_react2.default.Component);

exports.default = EasiCircleChart;