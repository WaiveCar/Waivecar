module.exports= {
	'cards':{
		'successfull':{
			'Visa':{
				number:'4242424242424242',
				name:'Visa'
			},
			'Visa2':{
				number:'4012888888881881',
				name:'Visa'
			},
			'Visa_debit':{
				number:'4000056655665556',
				name:'Visa (debit)'
			},
			'MasterCard':{
				number:'5555555555554444',
				name:'MasterCard'
			},
			'MasterCard_debit':{
				number:'5200828282828210',
				name:'MasterCard (debit)'
			},
			'MasterCard_prepaid':{
				number:'5105105105105100',
				name:'MasterCard (prepaid)'
			},
			'American_Express':{
				number:'378282246310005',
				name:'American Express'
			},
			'American_Express2':{
				number:'371449635398431',
				name:'American Express'
			},
			'Discover':{
				number:'6011111111111117',
				name:'Discover'
			},
			'Discover2':{
				number:'6011000990139424',
				name:'Discover'
			},
			'Diners_Club':{
				number:'30569309025904',
				name:'Diners Club'
			},
			'Diners_Club2':{
				number:'38520000023237',
				name:'Diners Club'
			},
			'JCB':{
				number:'3530111333300000',
				name:'JCB'
			},
			'JCB2':{
				number:'3566002020360505',
				name:'JCB'
			}
		},
		'specifc':{
				'succeed':{
					number:'4000000000000077',
					description:'Charge will succeed and funds will be added directly to your available balance (bypassing your pending balance).',
				},
				'chargeSucceedAddressAndZipFail':{
					number:'4000000000000010',
					description:'With default account settings, charge will succeed but address_line1_check and address_zip_check will both fail.',
				},
				'chargeSucceedLine1Fail':{
					number:'4000000000000028',
					description:'With default account settings, charge will succeed but address_line1_check will fail.',
				},
				'chargeSucceedZipFail':{
					number:'4000000000000036',
					description:'With default account settings, charge will succeed but address_zip_check will fail.',
				},
				'chargeSuceedZipCheckANdLineCheckUnavailable':{
					number:'4000000000000044',
					description:'With default account settings, charge will succeed but address_zip_check and address_line1_check will both be unavailable.',
				},
				'WithCVCFail':{
					number:'4000000000000101',
					description:'With default account settings, charge will succeed unless a CVC is entered, in which case cvc_check will fail and the charge will be declined.',
				},
				'AttemptsToChargeCustomerFail':{
					number:'4000000000000341',
					description:'Attaching this card to a Customer object will succeed, but attempts to charge the customer will fail.',
				},
				'ChargeDeclined':{
					number:'4000000000000002',
					description:'Charge will be declined with a card_declined code.',
				},
				'ChargeDeclinedFraudulent':{
					number:'4100000000000019',
					description:'Charge will be declined with a card_declined code and a fraudulent reason.',
				},
				'IncorecctCVC':{
					number:'4000000000000127',
					description:'Charge will be declined with an incorrect_cvc code.',
				},
				'ExpiredCard':{
					number:'4000000000000069',
					description:'Charge will be declined with an expired_card code.',
				},
				'DeclinedProcessingError':{
					number:'4000000000000119',
					description:'Charge will be declined with a processing_error code.',
				}
		}
	}
};