function addPromiseTests(testObj){
	testObj.testPromiseSuccess=function(promise,testFn){
		promise.then(function(){
			var args = Array.prototype.slice.call(arguments);
			testFn.apply(testObj, args);
		})
		.catch(function(){
			fail();
		})
		testObj.$rootScope.$digest();
	};
	testObj.testPromiseFailure=function(promise,expectedErrorOrFunction){
		promise.then(function(){
			fail();
		})
		.catch(function(error){
			var args = Array.prototype.slice.call(arguments);
			if (typeof expectedErrorOrFunction === "function") {
				expectedErrorOrFunction.apply(testObj, args);
			}
			else{
				expect(error).toEqual(expectedErrorOrFunction);
			}
		})
		testObj.$rootScope.$digest();
	};

}