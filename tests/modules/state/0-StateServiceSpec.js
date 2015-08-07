fdescribe('State service',function(){
	var $q;

	 beforeEach(function(){
		var self=this;
		addPromiseTests(this);
		angular.mock.module('State');
		angular.mock.inject(function(StateService,$rootScope,_$q_){
			self.service = StateService;
			self.$rootScope = $rootScope;
			$q=_$q_;
		});
	});
	it('Should be able to initialize a state flow',function(){
		var flowName='testFlow';
		var states=[
			{
				name:'first',
			},
			
		];
		this.service.setStateFlow(flowName,states);

		expect(this.service._flows[flowName].states).toEqual(states);
	});
	it('Should not be able to have a state with the same name',function(){
		var flowName='testFlow';
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
	describe('State flow',function(){
		var flowName='testFlow';
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
			this.service.setStateFlow(flowName,states);
		})	

		it('The flow should start on the first state',function(){
			var currentState=this.service.getCurrentState(flowName);
			expect(currentState).toEqual(states[0].name);

		});
		it('The user can skip to a given state',function(){
			var expectedName=states[1].name;
			var self=this;
			var p=this.service.goTo(flowName,expectedName);
			this.testPromiseSuccess(p,function(){
				var currentState=self.service.getCurrentState(flowName);
				expect(currentState).toEqual(expectedName);
			});
		})
		it('The user can go to the next stage if it\'s not the last',function(){
			var expectedName=states[1].name;
			var p=this.service.next(flowName);
			var self=this;
			this.testPromiseSuccess(p,function(){
				var currentState=self.service.getCurrentState(flowName);
				expect(currentState).toEqual(expectedName);
			});
		});
		it('The user can go to the previous state if it\s not the first',function(){
			var expectedName=states[1].name;
			var self=this;
			var p=this.service.goTo(flowName,states[2].name).then(function(){
				return self.service.previous(flowName);
			});
			this.testPromiseSuccess(p,function(){
				var currentState=self.service.getCurrentState(flowName);
				expect(currentState).toEqual(expectedName);
			});
		});
		it('The user can\'t go to the next state if it\'s the last',function(){
			var self=this;
			var expectedError=new Error('Can\'t go to the next state the current state is the last');
			var p=this.service.goTo(flowName,states[states.length-1].name).then(function(){
				return self.service.next(flowName);
			})
			this.testPromiseFailure(p,expectedError);
		});
		it('The user can\'t go to previous state if it\'s the first',function(){
			var self=this;
			var expectedError=new Error('Can\'t go to the previous state the current state is the first one');
			var p = self.service.previous(flowName);
			this.testPromiseFailure(p,expectedError);
		});
		describe('Flow rules',function(){
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
				{name:'toBeRedirected'}

				
			];
			beforeEach(function(){
				flag =null;
				this.service.setStateFlow(flowName,states);
			});
			describe('Arrival',function(){
				var desiredState='arriveIfFlag';
				function getArriveError(fromState,toState){
					return new Error('The rules of '+fromState+' doesn\'t allow the arrival, current state: '+toState);
				}
				// var expectedArrivalError= new Error ("The rules doesn't allow the arrival of ")
				it('Can\'t go to a state if the rule doesn\'t allow',function(){
					var self=this;
					flag=false;
					var expectedError = getArriveError(desiredState,'first');
					var p=self.service.goTo(flowName,desiredState);
					this.testPromiseFailure(p,expectedError);
				});
				it('Can\'t forward to a state if the rule doesn\'t allow',function(){
					var self=this;
					flag=false;
					var expectedError = getArriveError(desiredState,'first');
					var p =self.service.next(flowName);
					this.testPromiseFailure(p,expectedError);
				});
				it('Can\'t return to a state if the rule doesn\'t allow',function(){
					flag=false;
					var self=this;
					var p=this.service.goTo(flowName,'neutral_1').then(function(){
						return self.service.previous(flowName);
					});
					var expectedError = getArriveError(desiredState,'neutral_1');
					this.testPromiseFailure(p,expectedError);

				});
				it('Can go to a state if the rule  allow',function(){
					flag=true;
					var self=this;
					var p=this.service.goTo(flowName,desiredState);
					this.testPromiseSuccess(p,function(){
						expect(self.service.getCurrentState(flowName)).toEqual(desiredState);		
					})
				});
				it('Can forward to a state if the rule allow',function(){
					flag=true;
					var self=this;
					var p=this.service.next(flowName);
					this.testPromiseSuccess(p,function(){
						expect(self.service.getCurrentState(flowName)).toEqual(desiredState);		
					});
				});
				it('Can return to a state if the rule allow',function(){
					flag= true;
					var self=this;
					var p=this.service.goTo(flowName,'neutral_1').then(function(){
						return self.service.previous(flowName);
					})
					this.testPromiseSuccess(p,function(){
						expect(self.service.getCurrentState(flowName)).toEqual(desiredState);		
					});
				});
				it('Can handle a rule that returns a successful promise',function(){
					flag=true;
					var self=this;
					var p=this.service.goTo(flowName,'promise');
					this.testPromiseSuccess(p,function(){
						expect(self.service.getCurrentState(flowName)).toEqual('promise');		
					})
				});
				it('Can handle a rule that returns a rejected promise',function(){
					flag=false;
					var p=this.service.goTo(flowName,'promise');
					var expectedError = getArriveError('promise','first');

					this.testPromiseFailure(p,expectedError);
				});
				it('Goes to a state if a string is retured on arrive',function(){
					var self=this;
					var p=this.service.goTo(flowName,'stateChange');
					this.testPromiseSuccess(p,function(value){
						expect(self.service.getCurrentState(flowName)).toEqual('toBeRedirected');		
					});
				});
				describe('Previous state check',function(){
					var desiredState = 'neutralCheck';
					it('Can\'t go to a state if the rule doesn\'t allow',function(){
						var self=this;
						flag = false;
						var p=this.service.goTo(flowName,'neutral_1').then(function(){
							return self.service.goTo(flowName,desiredState);
						})
						var expectedError = getArriveError(desiredState,'neutral_1');
						this.testPromiseFailure(p,expectedError);
					});
					it('Can\'t forward to a state if the rule doesn\'t allow',function(){
						var self=this;
						flag = false;
						var p=this.service.goTo(flowName,'neutral_Before').then(function(){
							return self.service.next(flowName);
						})
						var expectedError = getArriveError(desiredState,'neutral_Before');
						this.testPromiseFailure(p,expectedError);
					});
					it('Can\'t return to a state if the rule doesn\'t allow',function(){
						var self=this;
						flag = false;
						var p=this.service.goTo(flowName,'neutral_After').then(function(){
							return self.service.previous(flowName);
						});
						var expectedError = getArriveError(desiredState,'neutral_After');
						this.testPromiseFailure(p,expectedError);
					});
					it('Can go to a state if the rule allow',function(){
						flag = true;
						var self=this;
						var p=this.service.goTo(flowName,'neutral_1').then(function(){
							return  self.service.goTo(flowName,desiredState);
						})
						this.testPromiseSuccess(p,function(){
							expect(self.service.getCurrentState(flowName)).toEqual(desiredState);
						})
					});
					it('Can\forward to a state if the rule allow',function(){
						flag = true;
						var self=this;
						var p = this.service.goTo(flowName,'neutral_Before').then(function(){
							return self.service.next(flowName);
						})
						this.testPromiseSuccess(p,function(){
							expect(self.service.getCurrentState(flowName)).toEqual(desiredState);
						});
					});
					it('Can return to a state if the rule allow',function(){
						flag = true;
						var self=this;
						var p = this.service.goTo(flowName,'neutral_After').then(function(){
							return self.service.previous(flowName);
						})
						this.testPromiseSuccess(p,function(){
							expect(self.service.getCurrentState(flowName)).toEqual('neutralCheck');
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
					this.service.goTo(flowName,desiredState);
					this.$rootScope.$digest();
					
				});
				it('Can\'t leave a state if the rule doesn\'t allow',function(){
					var self=this;
					flag=false;
					var expectedError = getLeaveError(desiredState);
					var p=  self.service.goTo(flowName,'neutral_1');
					this.testPromiseFailure(p,expectedError);
				});
				it('Can\'t forward to a state if the rule doesn\'t allow',function(){
					var self=this;
					flag=false;
					var expectedError = getLeaveError(desiredState);
					var p = self.service.next(flowName);
					this.testPromiseFailure(p,expectedError);
				});
				it('Can\'t previous to a state if the rule doesn\'t allow',function(){
					var self=this;
					flag=false;
					var expectedError = getLeaveError(desiredState);
					var p = self.service.previous(flowName);
					this.testPromiseFailure(p,expectedError);
				});
				it('Can leave a state if the rule  allow',function(){
					flag=true;
					var p=this.service.goTo(flowName,'neutral_1');
					this.testPromiseSuccess(p,function(){
						expect(this.service.getCurrentState(flowName)).toEqual('neutral_1');
					});
				});
				it('Can forward to a state if the rule allow',function(){
					flag=true;
					var p = this.service.next(flowName);
					this.testPromiseSuccess(p,function(){
						expect(this.service.getCurrentState(flowName)).toEqual('neutral_2');
					});
				});
				it('Can previous to a state if the rule  allow',function(){
					flag=true;
					var p = this.service.previous(flowName);
					this.testPromiseSuccess(p,function(){
						expect(this.service.getCurrentState(flowName)).toEqual('neutral_1');
					});
				});
			});

		});
	 });
});