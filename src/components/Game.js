import React, { Component } from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity, Text } from 'react-native';
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
				},
				{
					x: 75,
					y: 50
				},
				{
					x: 100,
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
			isShow: false
		};

		this.updateHandler = this.updateHandler.bind(this);
	}

	updateHandler() {
		var _this = this;

		if (!moveInterval) {
			moveInterval = setInterval(() => {
				_this._move();
			}, 300);
		}

		//_this._checkBorder();

		if (!_this.state.isShow) {
			_this._randomGenerate();
		}
	}

	_eat() {
		let _this = this;
		if (_this.state.data[0].x === _this.state.newX && _this.state.data[0].y === _this.state.newY) {
			let tail = _this.state.data[_this.state.data.length - 1];

			switch (_this.state.direction) {
				case 'top':
					_this.setState({
						data: [
							..._this.state.data,
							{
								x: tail.x,
								y: tail.y + _this.state.height
							}
						],
						isShow: false
					});
					break;
				case 'down':
					_this.setState({
						data: [
							..._this.state.data,
							{
								x: tail.x,
								y: tail.y - _this.state.height
							}
						],
						isShow: false
					});
					break;
				case 'left':
					_this.setState({
						data: [
							..._this.state.data,
							{
								x: tail.x + _this.state.width,
								y: tail.y
							}
						],
						isShow: false
					});
					break;
				case 'right':
					_this.setState({
						data: [
							..._this.state.data,
							{
								x: tail.x - _this.state.width,
								y: tail.y
							}
						],
						isShow: false
					});
					break;
			}
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
	}

	// 檢查是否碰到邊界
	_checkBorder() {
		let _this = this;

		if (_this.state.data[0].x >= WIDTH) {
			_this.setState({
				data: [
					{
						x: 0,
						y: _this.state.data[0].y
					}
				]
			});
		} else if (_this.state.data[0].x <= 0) {
			_this.setState({
				data: [
					{
						x: WIDTH,
						y: _this.state.data[0].y
					}
				]
			});
		}

		if (_this.state.data[0].y >= HEIGHT) {
			_this.setState({
				data: [
					{
						x: _this.state.data[0].x,
						y: 0
					}
				]
			});
		} else if (_this.state.data[0].y <= 0) {
			_this.setState({
				data: [
					{
						x: _this.state.data[0].x,
						y: HEIGHT
					}
				]
			});
		}
	}

	//隨機產生食物
	_randomGenerate() {
		let _this = this;

		if (!_this.state.isShow) {
			let maxX = Math.ceil(WIDTH / _this.state.width);
			let maxY = Math.ceil(HEIGHT / _this.state.height);

			let x = Math.floor(Math.random() * Math.floor(maxX));
			let y = Math.floor(Math.random() * Math.floor(maxY));

			let positionX = x * _this.state.width;
			let positionY = y * _this.state.height;

			this.setState({
				newX: positionX,
				newY: positionY
			});

			_this.setState({
				isShow: true
			});
		}
	}

	render() {
		return (
			<GameLoop style={{ flex: 1, position: 'relative' }} onUpdate={this.updateHandler}>
				{this.state.data.map((value, index) => {
					return <View style={[ styles.square, { left: value.x, top: value.y } ]} key={index} />;
				})}

				<View style={[ styles.square, { left: this.state.newX, top: this.state.newY } ]} />

				<TouchableOpacity
					style={[ styles.triangle, { left: WIDTH - 100, top: HEIGHT - 150 } ]}
					onPress={() => this.setState({ direction: 'top' })}
				/>
				<TouchableOpacity
					style={[ styles.triangle, styles.leftTriangle, { left: WIDTH - 150, top: HEIGHT - 100 } ]}
					onPress={() => this.setState({ direction: 'left' })}
				/>
				<TouchableOpacity
					style={[ styles.triangle, styles.rightTriangle, { left: WIDTH - 50, top: HEIGHT - 100 } ]}
					onPress={() => this.setState({ direction: 'right' })}
				/>
				<TouchableOpacity
					style={[ styles.triangle, styles.downTriangle, { left: WIDTH - 100, top: HEIGHT - 50 } ]}
					onPress={() => this.setState({ direction: 'down' })}
				/>
			</GameLoop>
		);
	}
}

const styles = StyleSheet.create({
	square: {
		width: 25,
		height: 25,
		backgroundColor: 'red',
		position: 'absolute'
	},

	triangle: {
		width: 0,
		height: 0,
		backgroundColor: 'transparent',
		borderStyle: 'solid',
		borderLeftWidth: 25,
		borderRightWidth: 25,
		borderBottomWidth: 50,
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
		borderBottomColor: 'red',
		position: 'absolute'
	},

	leftTriangle: {
		transform: [
			{
				rotate: '-90deg'
			}
		]
	},

	rightTriangle: {
		transform: [
			{
				rotate: '90deg'
			}
		]
	},

	downTriangle: {
		transform: [
			{
				rotate: '180deg'
			}
		]
	}
});

export default Game;
