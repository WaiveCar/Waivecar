fdescribe('State service',function(){
	var mockState={
		go:jasmine.createSpy('go')
	}
	 beforeEach(function(){
		var self=this;
		angular.mock.module('State',function($provide){
			$provide.value("$state", mockState);

		});
		angular.mock.inject(function(StateService){
			self.service=StateService;
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
			this.service.goTo(flowName,expectedName);
			var currentState=this.service.getCurrentState(flowName);
			expect(currentState).toEqual(expectedName);
			expect(mockState.go).toHaveBeenCalledWith(expectedName);
		})
		it('The user can go to the next stage if it\'s not the last',function(){
			var expectedName=states[1].name;
			this.service.next(flowName);
			var currentState=this.service.getCurrentState(flowName);
			expect(currentState).toEqual(expectedName);
			expect(mockState.go).toHaveBeenCalledWith(expectedName);
		});
		it('The user can go to the previous state if it\s not the first',function(){
			var expectedName=states[1].name;
			this.service.goTo(flowName,states[2].name);
			this.service.previous(flowName);
			var currentState=this.service.getCurrentState(flowName);
			expect(currentState).toEqual(expectedName);
			expect(mockState.go.calls.mostRecent().args).toEqual([expectedName])
		});
		it('The user can\'t go to the next state if it\'s the last',function(){
			this.service.goTo(flowName,states[states.length-1].name);
			var self=this;
			var expectedError=new Error('Can\'t go to the next state the current state is the last');
			expect( function(){ self.service.next(flowName);} )
			.toThrow(expectedError);
		});
		it('The user can\'t go to previous state if it\'s the first',function(){
			var self=this;
			var expectedError=new Error('Can\'t go to the previous state the current state is the first one');
			expect( function(){ self.service.previous(flowName);} )
			.toThrow(expectedError);
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
				{name:'neutral_After'}

				
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
					expect( function(){ self.service.goTo(flowName,desiredState);} )
					.toThrow(expectedError);
				});
				it('Can\'t forward to a state if the rule doesn\'t allow',function(){
					var self=this;
					flag=false;
					var expectedError = getArriveError(desiredState,'first');

					expect( function(){ self.service.next(flowName);} )
					.toThrow(expectedError);
				});
				it('Can\'t return to a state if the rule doesn\'t allow',function(){
					this.service.goTo(flowName,'neutral_1');
					var expectedError = getArriveError(desiredState,'neutral_1');
					flag=false;
					var self=this;
					expect( function(){ self.service.previous(flowName);} )
					.toThrow(expectedError);
				});
				it('Can go to a state if the rule  allow',function(){
					flag=true;
					this.service.goTo(flowName,desiredState);
					expect(this.service.getCurrentState(flowName)).toEqual(desiredState);
				});
				it('Can forward to a state if the rule allow',function(){
					flag=true;
					this.service.next(flowName);
					expect(this.service.getCurrentState(flowName)).toEqual(desiredState);
				});
				it('Can return to a state if the rule allow',function(){
					flag= true;
					this.service.goTo(flowName,'neutral_1');
					this.service.previous(flowName);
					expect(this.service.getCurrentState(flowName)).toEqual(desiredState);
				});
				describe('Previous state check',function(){
					var desiredState = 'neutralCheck';
					it('Can\'t go to a state if the rule doesn\'t allow',function(){
						var self=this;
						flag = false;
						this.service.goTo(flowName,'neutral_1');
						var expectedError = getArriveError(desiredState,'neutral_1');
						expect( function(){ self.service.goTo(flowName,desiredState);} )
						.toThrow(expectedError);
					});
					it('Can\'t forward to a state if the rule doesn\'t allow',function(){
						var self=this;
						flag = false;
						this.service.goTo(flowName,'neutral_Before');
						var expectedError = getArriveError(desiredState,'neutral_Before');
						expect( function(){ self.service.next(flowName);} )
						.toThrow(expectedError);
					});
					it('Can\'t return to a state if the rule doesn\'t allow',function(){
						var self=this;
						flag = false;
						this.service.goTo(flowName,'neutral_After');
						var expectedError = getArriveError(desiredState,'neutral_After');
						expect( function(){ self.service.previous(flowName);} )
						.toThrow(expectedError);
					});
					it('Can go to a state if the rule allow',function(){
						flag = true;
						this.service.goTo(flowName,'neutral_1');
						this.service.goTo(flowName,desiredState);
						expect(this.service.getCurrentState(flowName)).toEqual(desiredState);
					});
					it('Can\forward to a state if the rule allow',function(){
						flag = true;
						this.service.goTo(flowName,'neutral_Before');
						this.service.next(flowName);
						expect(this.service.getCurrentState(flowName)).toEqual(desiredState);
					});
					it('Can return to a state if the rule allow',function(){
						flag = true;
						this.service.goTo(flowName,'neutral_After');
						this.service.previous(flowName);
						expect(this.service.getCurrentState(flowName)).toEqual(desiredState);
					});
				});
			});
			describe('Leaving',function(){
				function getLeaveError(desiredState){
					return new Error('The rules of '+desiredState+' doesn\'t allow leaving it right now');
				}
				var desiredState='leaveIfFlag';
				it('Can\'t leave a state if the rule doesn\'t allow',function(){
					this.service.goTo(flowName,'leaveIfFlag');

					var self=this;
					flag=false;
					var expectedError = getLeaveError(desiredState);
					expect( function(){ self.service.goTo(flowName,'neutral_1');} )
					.toThrow(expectedError);
				});
			});

		});
	 });
});