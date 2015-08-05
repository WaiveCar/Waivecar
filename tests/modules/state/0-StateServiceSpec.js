fdescribe('State service',function(){
	 beforeEach(function(){
        var self=this;
        angular.mock.module('State');
        angular.mock.inject(function(StateService){
        	self.service=StateService;
        });
    });
	it('Should be able to initialize a state flow',function(){
		var flowName='testFlow';
		var rules=[
			{
				name:'firts',
				rules:{
					arrive:function(fromStte){

					},
					leave:function(nextState){

					}
				}
			},
			
		];
		this.service.setStateFlow(flowName,rules);

		expect(this.service._flows[flowName].rules).toEqual(rules);
	});
	describe('State flow',function(){
		var flowName='testFlow';
		var rules=[
			{
				name:'firts',
				rules:{
					arrive:function(fromStte){

					},
					leave:function(nextState){

					}
				}
			},
			
		];
	 	beforeEach(function(){
			this.service.setStateFlow(flowName,rules);
	 	})	

	 	it('The flow should start on the first state',function(){
	 		var currentState=this.service.getCurrentState(flowName);
	 		expect(currentState).toEqual(rules[0].name);

	 	});
	 	it('The user can go to the next stage if it\'s not the last');
	 	it('The user can go to the previous state if it\s not the first');
	 	describe('Flow rules',function(){
	 		it('Can set rules to a state flow');
	 		it('Can\'t arrive at a state if the rule doesn\'t allow');
	 		it('Can\'t go to the next state if the rule doesn\'t allow');
	 		it('Can\'t go to the previous state if the rule doesn\'t allow');

	 	});
	 });
});