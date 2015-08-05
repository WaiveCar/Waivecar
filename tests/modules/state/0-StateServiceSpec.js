fdescribe('State service',function(){
	 beforeEach(function(){
        var self=this;
        angular.mock.module('State');
        angular.mock.inject(function(StateService){
        	self.service=StateService;
        });
    });
	 describe('State flow',function(){
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
	 		
	 		expect(this.service._flows[flowName]).toEqual(rules);
	 	});
	 	it('The flow should start on the first state');
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