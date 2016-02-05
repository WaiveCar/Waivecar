describe('Flow control',function(){
	var $q;
	var $rootScope;
	var flowName = 'testFlow';
	beforeEach(function(){
		var self=this;
		addPromiseTests(this);
		angular.mock.module('FlowControl');
		angular.mock.inject(function(FlowControlService,_$rootScope_,_$q_){
			self.service = FlowControlService;
			self.$rootScope = _$rootScope_;
			$rootScope= _$rootScope_;
			$q=_$q_;
		});
	});
	it('Should be able to initialize a state flow',function(){
		var states=[
			{
				name:'first',
			},
			
		];
		this.service.setStateFlow(flowName,states);
		expect(this.service._flows[flowName].states).toEqual(states);
	});
	it('Should not be able to have a state with the same name',function(){
		var states=[
			{
				name:'first',
			},
			{
				name:'first'
			}
			
		];
		var self=this;
		var expectedError=new Error('The state '+states[0].name+' already exists');
		expect( function(){ self.service.setStateFlow(flowName,states);} )
		.toThrow(expectedError);
	});
	it('The flow should start on a null state',function(){
		var states=[
			{
				name:'first',
			}
		];
		var flow = this.service.setStateFlow(flowName,states);
		var currentState=flow.getCurrentStateName();
		expect(currentState).toEqual(null);

	});
	it('Goes to the first state from the null using goTo',function(){
		var states=[
			{
				name:'first',
			}
		];
		var flow = this.service.setStateFlow(flowName,states);
		flow.goTo('first');
		this.$rootScope.$digest();
		var currentState=flow.getCurrentStateName();
		expect(currentState).toEqual('first');
	});
	it('Goes to the first state from the null using next',function(){
		var states=[
			{
				name:'first',
			}
		];
		var flow = this.service.setStateFlow(flowName,states);
		flow.next();
		this.$rootScope.$digest();
		var currentState=flow.getCurrentStateName();
		expect(currentState).toEqual('first');
	});
	it('Can\'t go back to the initial state (nullable)',function(){
		var states=[
			{
				name:'first',
			}
		];
		var flow = this.service.setStateFlow(flowName,states);
		var p=flow.next().then(function(){
			return flow.previous();
		});
		this.$rootScope.$digest();
		p.then(function(){
			fail();
		})
		.catch(function(error){
			console.log(error);
		})
	});
	describe('State redirection',function(){
		var expectedParams = {'bar':'baz'};
		var expectedName = 'toBeRedirected';
		var rule=function(){
			return {
				name:expectedName,
				params:expectedParams
			}
		};
		function testStateRedirection(promise,flow){
			promise.then(function(redirectData){
				expect(redirectData.name).toEqual(expectedName);
				expect(redirectData.params).toEqual(expectedParams);
				expect(redirectData.isRedirect).toEqual(true);
				expect(flow.getCurrentStateName()).toEqual(expectedName);
				expect(flow.getCurrentStateParams()).toEqual(expectedParams);
			})
			.catch(function(){
				fail();
			})
			$rootScope.$digest();
		}
		it('Can redirect to a state using next on the leave of the currentState',function(){
			var states=[
				{
					name:'first',
					rules:{
						leave:rule
					}
				},
				{name:'toTest'},
				{name:expectedName}
			];
			var flow = this.service.setStateFlow(flowName,states);
			var p=flow.goTo('first').then(function(){
				return flow.next();
			});
			testStateRedirection(p,flow);
		});
		it('Can redirect to a state using next on the arrive of the next',function(){
			var states=[
				{
					name:'first',
				},
				{
					name:'toTest',
					rules:{
						arrive:rule
					}
				},
				{name:expectedName}

			];
			var flow = this.service.setStateFlow(flowName,states);
			var p=flow.goTo('first').then(function(){
				return flow.next();
			});
			testStateRedirection(p,flow);
		});

		it('Can redirect to a state using previous on the  arrive of the previous state',function(){
			var states=[
				{
					name:'toTest',
					rules:{
						arrive:rule
					}
				},
				{
					name:'second',
				},
				{name:expectedName}

			];
			var flow = this.service.setStateFlow(flowName,states);
			var p=flow.goTo('second').then(function(){
				return flow.previous();
			});
			testStateRedirection(p,flow);
		});
		it('Can redirect to a state using previous on the leave of the current state',function(){
			var states=[
				{
					name:'toTest'
				},
				{
					name:'second',
					rules:{
						leave:rule
					}
				},
				{name:expectedName}

			];
			var flow = this.service.setStateFlow(flowName,states);
			var p=flow.goTo('second').then(function(){
				return flow.previous();
			});
			testStateRedirection(p,flow);
		});

		it('Can redirect to a state using goTo on the leave of the current state',function(){
			var states=[
				{
					name:'first',
					rules:{
						leave:rule
					}
				},
				{name:'neutral'},
				{
					name:'toTest',
					
				},
				{name:expectedName}

			];
			var flow = this.service.setStateFlow(flowName,states);
			var p=flow.goTo('first').then(function(){
				return flow.goTo('toTest');
			});
			testStateRedirection(p,flow);
		});
		it('Can redirect to a state using goTo on the arrive of the desired state',function(){
			var states=[
				{
					name:'first'
				},
				{name:'neutral'},
				{
					name:'toTest',
					rules:{
						arrive:rule
					}
				},
				{name:expectedName}

			];
			var flow = this.service.setStateFlow(flowName,states);
			var p=flow.goTo('first').then(function(){
				return flow.goTo('toTest');
			});
			testStateRedirection(p,flow);
		});

	});
	describe('State flow',function(){
		var flow;
		var states=[
			{
				name:'first',
			},
			{
				name:'second'
			},
			{
				name:'last'
			}
			
		];
		beforeEach(function(){
			flow=this.service.setStateFlow('testFlow',states);
			flow.goTo(states[0].name);
			this.$rootScope.$digest();
		})	

		it('The user can skip to a given state',function(){
			var expectedName=states[1].name;
			var p=flow.goTo(expectedName);
			this.testPromiseSuccess(p,function(){
				var currentState=flow.getCurrentStateName();
				expect(currentState).toEqual(expectedName);
			});
		})
		it('The user can go to the next stage if it\'s not the last',function(){
			var expectedName=states[1].name;
			var p=flow.next();
			this.testPromiseSuccess(p,function(){
				var currentState=flow.getCurrentStateName();
				expect(currentState).toEqual(expectedName);
			});
		});
		it('The user can go to the previous state if it\s not the first ',function(){
			var expectedName=states[1].name;
			var p=flow.goTo(states[2].name).then(function(){
				return flow.previous();
			});
			this.testPromiseSuccess(p,function(){
				var currentState=flow.getCurrentStateName();
				expect(currentState).toEqual(expectedName);
			});
		});
		it('The user can\'t go to the next state if it\'s the last',function(){
			var expectedError=new Error('Can\'t go to the next state the current state is the last');
			var p=flow.goTo(states[states.length-1].name).then(function(){
				return flow.next();
			})
			this.testPromiseFailure(p,expectedError);
		});
		it('The user can\'t go to previous state if it\'s the first',function(){
			var expectedError=new Error('Can\'t go to the previous state the current state is the first one');
			var p = flow.previous();
			this.testPromiseFailure(p,expectedError);
		});
		describe('With params',function(){
			var flow;
			var states=[
				{
					name:'first',
					rules:{
						arrive:jasmine.createSpy('firstWithParam').and.returnValue(true)
					}

				},
				{
					name:'second',
					
				},
				{
					name:'third',
					rules:{
						arrive:jasmine.createSpy('thirdWithParam').and.returnValue(true)
					}
				},
				{
					name:'fourth'
				},
				{
					name:'fifth'
				},
				{
					name:'sixth'
				},
			];
			var expectedParams= {'foo':'bar','baz':'xpto'};
			beforeEach(function(){
				flow=this.service.setStateFlow(flowName,states);
				flow.goTo('second');
				this.$rootScope.$digest();
			});
			it('Passes a parameter to be evaluated on goTo',function(){

				var desiredState = states[0];
				flow.goTo(desiredState.name,expectedParams).then(function(data){
					expect(data.name).toEqual(desiredState.name)
					expect(data.params).toEqual(expectedParams);
					expect(desiredState.rules.arrive).toHaveBeenCalledWith('second',expectedParams);
					expect(flow.getCurrentStateParams()).toEqual(expectedParams);
				})
				.catch(function(){
					fail();
				});
				this.$rootScope.$digest();
			});		
			it('Passes a parameter to be evaluated on previous',function(){
				var desiredState = states[0];
				flow.previous(expectedParams).then(function(data){
					expect(data.name).toEqual(desiredState.name)
					expect(data.params).toEqual(expectedParams);
					expect(desiredState.rules.arrive).toHaveBeenCalledWith('second',expectedParams);
					expect(flow.getCurrentStateParams()).toEqual(expectedParams);
				})
				.catch(function(){
					fail();
				});
				this.$rootScope.$digest();

			});	
			it('Passes a parameter to be evaluated on next',function(){
				var desiredState = states[2];
				flow.next(expectedParams).then(function(data){
					expect(data.name).toEqual(desiredState.name)
					expect(data.params).toEqual(expectedParams);
					expect(desiredState.rules.arrive).toHaveBeenCalledWith('second',expectedParams);
					expect(flow.getCurrentStateParams()).toEqual(expectedParams);
				})
				.catch(function(){
					fail();
				});
				this.$rootScope.$digest();
			});
			it('Register the previous state params ',function(){
				flow.next(expectedParams).then(function(data){
					return flow.previous();
				})
				.then(function(data){
					expect(flow.getPreviousStateParams()).toEqual(expectedParams);
				})
				.catch(function(){
					fail();
				});
				this.$rootScope.$digest();
			});
			it('Propagates a param  on next if no new param is passed',function(){
				flow.goTo('fourth',expectedParams).then(function(){
					expect(flow.getCurrentStateParams()).toEqual(expectedParams);
					return flow.next();
				}).then(function(data){
					expect(flow.getCurrentStateParams()).toEqual(expectedParams);
					expect(flow.getPreviousStateParams()).toEqual(flow.getCurrentStateParams());
					
				});
				this.$rootScope.$digest();

			});
			it('Uses the previous param on previous if no new param is passed',function(){
				flow.goTo('fifth',expectedParams).then(function(){
					expect(flow.getCurrentStateParams()).toEqual(expectedParams);
					flow.next({}).then(function(){
						return flow.previous();
					})
				}).then(function(data){
					expect(flow.getCurrentStateParams()).toEqual(expectedParams);					
				});
				this.$rootScope.$digest();
			});
			it('Propagates a param  on previous goTo if no new param is passed',function(){
				flow.goTo('fifth',expectedParams).then(function(){
					return flow.goTo('fourth')
				})
				.then(function(data){
					expect(flow.getCurrentStateParams()).toEqual(expectedParams);
				})
			});

		});
		describe('Flow rules',function(){
			var flow;
			var flag=null;
			var states=[
				{
					name:'first'
				},
				{
					name:'arriveIfFlag',
					rules:{
						arrive:function(){
							return flag;
						}
					}
				},
				{name:'neutral_1'},
				{
					name:'leaveIfFlag',
					rules:{
						leave:function(){
							return flag;
						}
					}
				},
				{name:'neutral_2'},

				{name:'neutral_Before'},
				{
					name:'neutralCheck',
					rules:{
						arrive:function(fromState){
							var isNeutral=fromState.indexOf('neutral')===0;
							if(flag){
								return isNeutral;
							}
							else{
								return !isNeutral;
							}
						}
					}
				},
				{name:'neutral_After'},
				{
					name:'promise',
					rules:{
						arrive:function(){
							if(flag){
								return $q.resolve(flag);
							}
							return $q.reject(flag);
						}
					}
				},
				{
					name:'stateChange',
					rules:{
						arrive:function(){
							return 'toBeRedirected';
						}
					}
				},
				{name:'toBeRedirected'},
				{name:'ruleCheckOne'},
				{
					name:'withArrive',
					arrive:function(){
						return true;
					}
				},
				{
					name:'ruleCheckWithLeave',
					leave:function(){
						return true;
					}
				},				
			];
			beforeEach(function(){
				flag =null;
				flow=this.service.setStateFlow(flowName,states);
				flow.goTo(states[0].name);
				this.$rootScope.$digest();
			});
			// describe('Rule check',function(){
			// 	it('Has rule when it just has a arrive rule',function(){
			// 		expect(true).toEqual(true);
			// 	});
			// 	it('Has rule when it just have a leave rule');
			// 	it('Has rule when it have both a arrive and leave rule');
			// 	it('Has no rule when it doesn\'t have a arrive and a leave rule');
			// });
			describe('Arrival',function(){
				var desiredState='arriveIfFlag';
				function getArriveError(fromState,toState){
					return new Error('The rules of '+fromState+' doesn\'t allow the arrival, current state: '+toState);
				}
				// var expectedArrivalError= new Error ("The rules doesn't allow the arrival of ")
				it('Can\'t go to a state if the rule doesn\'t allow',function(){
					flag=false;
					var expectedError = getArriveError(desiredState,'first');
					var p=flow.goTo(desiredState);
					this.testPromiseFailure(p,expectedError);
				});
				it('Can\'t forward to a state if the rule doesn\'t allow',function(){
					flag=false;
					var expectedError = getArriveError(desiredState,'first');
					var p =flow.next();
					this.testPromiseFailure(p,expectedError);
				});
				it('Can\'t return to a state if the rule doesn\'t allow',function(){
					flag=false;
					var p=flow.goTo('neutral_1').then(function(){
						return flow.previous();
					});
					var expectedError = getArriveError(desiredState,'neutral_1');
					this.testPromiseFailure(p,expectedError);

				});
				it('Can go to a state if the rule  allow',function(){
					flag=true;
					var p=flow.goTo(desiredState);
					this.testPromiseSuccess(p,function(){
						expect(flow.getCurrentStateName()).toEqual(desiredState);		
					})
				});
				it('Can forward to a state if the rule allow',function(){
					flag=true;
					var p=flow.next();
					this.testPromiseSuccess(p,function(){
						expect(flow.getCurrentStateName()).toEqual(desiredState);		
					});
				});
				it('Can return to a state if the rule allow',function(){
					flag= true;
					var p=flow.goTo('neutral_1').then(function(){
						return flow.previous();
					})
					this.testPromiseSuccess(p,function(){
						expect(flow.getCurrentStateName(flow)).toEqual(desiredState);		
					});
				});
				it('Can handle a rule that returns a successful promise',function(){
					flag=true;
					var p=flow.goTo('promise');
					this.testPromiseSuccess(p,function(){
						expect(flow.getCurrentStateName(flow)).toEqual('promise');		
					})
				});
				it('Can handle a rule that returns a rejected promise',function(){
					flag=false;
					var p=flow.goTo('promise');
					var expectedError = getArriveError('promise','first');

					this.testPromiseFailure(p,expectedError);
				});
				it('Goes to a state if a string is retured on arrive',function(){
					var p=flow.goTo('stateChange');
					this.testPromiseSuccess(p,function(value){
						expect(flow.getCurrentStateName(flow)).toEqual('toBeRedirected');		
					});
				});
				describe('Previous state check',function(){
					var desiredState = 'neutralCheck';
					it('Can\'t go to a state if the rule doesn\'t allow',function(){
						var p=flow.goTo('neutral_1').then(function(){
							return flow.goTo(desiredState);
						})
						var expectedError = getArriveError(desiredState,'neutral_1');
						this.testPromiseFailure(p,expectedError);
					});
					it('Can\'t forward to a state if the rule doesn\'t allow',function(){
						flag = false;
						var p=flow.goTo('neutral_Before').then(function(){
							return flow.next();
						})
						var expectedError = getArriveError(desiredState,'neutral_Before');
						this.testPromiseFailure(p,expectedError);
					});
					it('Can\'t return to a state if the rule doesn\'t allow',function(){
						flag = false;
						var p=flow.goTo('neutral_After').then(function(){
							return flow.previous();
						});
						var expectedError = getArriveError(desiredState,'neutral_After');
						this.testPromiseFailure(p,expectedError);
					});
					it('Can go to a state if the rule allow',function(){
						flag = true;
						var p=flow.goTo('neutral_1').then(function(){
							return  flow.goTo(desiredState);
						})
						this.testPromiseSuccess(p,function(){
							expect(flow.getCurrentStateName()).toEqual(desiredState);
						})
					});
					it('Can\forward to a state if the rule allow',function(){
						flag = true;
						var p = flow.goTo('neutral_Before').then(function(){
							return flow.next();
						})
						this.testPromiseSuccess(p,function(){
							expect(flow.getCurrentStateName()).toEqual(desiredState);
						});
					});
					it('Can return to a state if the rule allow',function(){
						flag = true;
						var p = flow.goTo('neutral_After').then(function(){
							return flow.previous();
						})
						this.testPromiseSuccess(p,function(){
							expect(flow.getCurrentStateName()).toEqual('neutralCheck');
						});
					});
				});
				
			});
			describe('Leaving',function(){
				function getLeaveError(desiredState){
					return new Error('The rules of '+desiredState+' doesn\'t allow leaving it right now');
				}
				var desiredState= 'leaveIfFlag';
				beforeEach(function(){
					flow.goTo(desiredState);
					this.$rootScope.$digest();
					
				});
				it('Can\'t leave a state if the rule doesn\'t allow',function(){
					flag=false;
					var expectedError = getLeaveError(desiredState);
					var p=  flow.goTo('neutral_1');
					this.testPromiseFailure(p,expectedError);
				});
				it('Can\'t forward to a state if the rule doesn\'t allow',function(){
					flag=false;
					var expectedError = getLeaveError(desiredState);
					var p = flow.next();
					this.testPromiseFailure(p,expectedError);
				});
				it('Can\'t previous to a state if the rule doesn\'t allow',function(){
					flag=false;
					var expectedError = getLeaveError(desiredState);
					var p = flow.previous();
					this.testPromiseFailure(p,expectedError);
				});
				it('Can leave a state if the rule  allow',function(){
					flag=true;
					var p=flow.goTo('neutral_1');
					this.testPromiseSuccess(p,function(){
						expect(flow.getCurrentStateName()).toEqual('neutral_1');
					});
				});
				it('Can forward to a state if the rule allow',function(){
					flag=true;
					var p = flow.next();
					this.testPromiseSuccess(p,function(){
						expect(flow.getCurrentStateName()).toEqual('neutral_2');
					});
				});
				it('Can previous to a state if the rule  allow',function(){
					flag=true;
					var p = flow.previous();
					this.testPromiseSuccess(p,function(){
						expect(flow.getCurrentStateName()).toEqual('neutral_1');
					});
				});
			});
			describe('Redirect',function(){
				
			});

		});
	 });
});