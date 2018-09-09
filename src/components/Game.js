import React, { Component } from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity, Text, PanResponder, Alert } from 'react-native';
import { GameLoop } from 'react-native-game-engine';

const { width: WIDTH, height: HEIGHT } = Dimensions.get('window');
let moveInterval = null;

class Game extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [
				{
					x: 50,
					y: 50
				}
			],
			deltaX: 0.9,
			deltaY: 0.9,
			width: 25,
			height: 25,
			direction: 'right',
			newX: 0,
			newY: 0,
			isShow: false,
			isShowAlert: false
		};

		this.updateHandler = this.updateHandler.bind(this);
	}

	componentWillMount() {
		this._panResponder = PanResponder.create({
			// Ask to be the responder:
			onStartShouldSetPanResponder: (evt, gestureState) => true,
			onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
			onMoveShouldSetPanResponder: (evt, gestureState) => true,
			onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

			onPanResponderRelease: (evt, gestureState) => {
				let { x0, y0, vx, vy, dx, dy } = gestureState;
				let _this = this;

				if (Math.abs(dx) >= 100) {
					if (dx > 100) {
						_this.setState({ direction: 'right' });
					}

					if (dx <= -100) {
						_this.setState({
							direction: 'left'
						});
					}
				} else if (Math.abs(dy) >= 100) {
					if (dy > 100) {
						_this.setState({
							direction: 'down'
						});
					}

					if (dy <= -100) {
						_this.setState({
							direction: 'top'
						});
					}
				}
			}
		});
	}

	updateHandler() {
		var _this = this;

		if (!moveInterval) {
			moveInterval = setInterval(() => {
				if (!_this.state.isShowAlert) {
					_this._move();
				}
			}, 150);
		}

		if (!_this.state.isShow) {
			_this._randomGenerate();
		}
	}

	_eat() {
		let _this = this;
		if (_this.state.data[0].x === _this.state.newX && _this.state.data[0].y === _this.state.newY) {
			let tail = _this.state.data[_this.state.data.length - 1];
			let head = _this.state.data[0];

			_this.setState({
				isShow: false
			});

			let isVertical = false;
			let isHorizontal = false;
			let isGreaterThree = false;
			let lastSecond;

			if (_this.state.data.length >= 3) {
				isGreaterThree = true;
				lastSecond = _this.state.data[_this.state.data.length - 2];

				if (lastSecond.x - tail.x === 0) {
					isVertical = true;
				}

				if (lastSecond.y - tail.y === 0) {
					isHorizontal = true;
				}
			}

			let foodTail = {};

			switch (_this.state.direction) {
				case 'top':
					if (!isGreaterThree || isVertical) {
						foodTail = {
							x: tail.x,
							y: tail.y + _this.state.height
						};
					}
					break;
				case 'down':
					if (!isGreaterThree || isVertical) {
						foodTail = {
							x: tail.x,
							y: tail.y - _this.state.height
						};
					}
					break;
				case 'left':
					if (!isGreaterThree || isHorizontal) {
						foodTail = {
							x: tail.x + _this.state.width,
							y: tail.y
						};
					}
					break;
				case 'right':
					if (!isGreaterThree || isHorizontal) {
						foodTail = {
							x: tail.x - _this.state.width,
							y: tail.y
						};
					}
					break;
			}

			switch (_this.state.direction) {
				case 'top':
				case 'down':
					if (isGreaterThree) {
						if (tail.x - lastSecond.x > 0) {
							foodTail = {
								x: tail.x + _this.state.width,
								y: tail.y
							};
						} else if (tail.x - lastSecond.x < 0) {
							foodTail = {
								x: tail.x - _this.state.width,
								y: tail.y
							};
						}
					}
					break;
				case 'right':
				case 'left':
					if (isGreaterThree) {
						if (tail.y - lastSecond.y > 0) {
							foodTail = {
								x: tail.x,
								y: tail.y + _this.state.height
							};
						} else if (tail.y - lastSecond.y < 0) {
							foodTail = {
								x: tail.x,
								y: tail.y - _this.state.height
							};
						}
					}
					break;
			}

			_this.setState({
				data: [ ..._this.state.data, foodTail ]
			});
		}
	}

	// 移動
	_move() {
		let _this = this;
		let dataTmp = _this.state.data.slice(0);
		let prevX, prevY;

		dataTmp.forEach((row, index) => {
			let tmp = row;
			if (index === 0) {
				switch (_this.state.direction) {
					case 'right':
						dataTmp[index] = {
							x: row.x + _this.state.width,
							y: row.y
						};
						break;
					case 'left':
						dataTmp[index] = {
							x: row.x - _this.state.width,
							y: row.y
						};
						break;
					case 'top':
						dataTmp[index] = {
							x: row.x,
							y: row.y - _this.state.height
						};
						break;
					case 'down':
						dataTmp[index] = {
							x: row.x,
							y: row.y + _this.state.height
						};
						break;
				}
			} else {
				dataTmp[index] = {
					x: prevX,
					y: prevY
				};
			}

			prevX = tmp.x;
			prevY = tmp.y;
		});

		_this.setState({
			data: dataTmp
		});

		_this._eat();
		_this._collision();
	}

	//是否碰撞
	_collision() {
		let _this = this;
		let first;
		let current;

		if (_this.state.data.length >= 2) {
			first = _this.state.data[0];
		}

		for (let i = 1; i < _this.state.data.length; i++) {
			current = _this.state.data[i];
			if (first.x === current.x && current.y === first.y) {
				_this._die();
				break;
			}
		}

		if (
			_this.state.data[0].x > WIDTH ||
			_this.state.data[0].x < 0 ||
			_this.state.data[0].y > HEIGHT ||
			_this.state.data[0].y < 0
		) {
			_this._die();
		}
	}

	//死掉時的彈窗以及初始化
	_die() {
		let _this = this;
		_this.setState({
			data: [
				{
					x: 50,
					y: 50
				}
			]
		});

		if (!_this.state.isShowAlert) {
			_this.setState({
				isShowAlert: true,
				direction: 'right'
			});

			Alert.alert(
				'Game Over',
				'',
				[
					{
						text: 'OK',
						onPress: () => {
							_this.setState({
								isShowAlert: false
							});
						}
					}
				],
				{ cancelable: false }
			);
		}
	}

	//隨機產生食物
	_randomGenerate() {
		let _this = this;

		if (!_this.state.isShow) {
			let maxX = Math.floor(WIDTH / _this.state.width);
			let maxY = Math.floor(HEIGHT / _this.state.height);

			let x = Math.floor(Math.random() * Math.floor(maxX));
			let y = Math.floor(Math.random() * Math.floor(maxY));
			let positionX = x * _this.state.width;
			let positionY = y * _this.state.height;

			// console.log(`[${positionX},${positionY}]`);

			// console.log(
			// 	_this.state.data.every((element, index) => {
			// 		return !(element.x !== positionX && element.y !== positionY);
			// 	})
			// );

			while (
				_this.state.data.every((element, index) => {
					return !(element.x !== positionX && element.y !== positionY);
				})
			) {
				x = Math.floor(Math.random() * Math.floor(maxX));
				y = Math.floor(Math.random() * Math.floor(maxY));
				positionX = x * _this.state.width;
				positionY = y * _this.state.height;
			}

			this.setState({
				newX: positionX,
				newY: positionY,
				isShow: true
			});
		}
	}

	render() {
		return (
			<View {...this._panResponder.panHandlers} style={{ flex: 1, position: 'relative' }}>
				<GameLoop style={{ flex: 1, position: 'relative' }} onUpdate={this.updateHandler}>
					{this.state.data.map((value, index) => {
						return <View style={[ styles.square, { left: value.x, top: value.y } ]} key={index} />;
					})}
					<View style={[ styles.square, { left: this.state.newX, top: this.state.newY } ]} />
				</GameLoop>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	square: {
		width: 25,
		height: 25,
		backgroundColor: 'red',
		position: 'absolute'
	}
});

export default Game;
