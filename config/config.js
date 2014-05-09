
var configuration = {

	domainUrl : "https://cloud.sailstech.com",

	/******** Main resource folder  ********/		
	resourcePath : "./resource/",

	/******** Folder path of Building and floor files  ********/
	imagePath : "public/client-image",
	
	mapInfoPath: "resource/map-info",

	/******** Download sdk, online doc and sample code path ********/

	sailsResPath: "resource/sails-relative-res",

	androidDocPath: "resource/sails-relative-res/android/Javadoc.rar",		

	iosDocPath: "resource/sails-relative-res/ios/doc.rar",		
		
	defaultAndroidSdkVersion: 1.2,

	defaultIosSdkVersion: 1.2,


	/******** Main sample building folder  ********/		
	sampleBuildingPath: "resource/map-info/Sample",

	/******** AppId and AppSecret of Facebook, twitter and google+ ********/	
	facebookAppKey: "191009537749511",
	
	facebookAppSecret: "bd632d3cae63b4ad4314a7238dd2aa19",
	
	twitterAppKey: "T9Ovg7MAiehY4XUPTfZzw",
	
	twitterAppSecret: "zcB3JUdQlCslW7546OdropON116vENwx84E0K8bloI",
	
	googleAppKey: "369163861143.apps.googleusercontent.com",
	
	googleAppSecret: "GjyzGopNhamfve2Ouhw9firR",

	/******** Default cookie duration ********/		
	defaultCookieDuration: 604800, // 7 days: 604800 <=> 60 * 60 * 24 * 7

	/******** Default token duration ********/	
	defaultTokenDuration: 86400, // 1 day: 86400 <=> 60 * 60 * 24
	
	/******** Max number of building count ********/	
	maxBuildingNumberOfUser: 50,

	/******** Max number of floor count ********/	
	maxFloorNumber: 100,
	maxBasementNumber: 20,

	/******** Pagination offset per page ********/	
	pageOffset: 30,

	/******** Google Analystic Relative ********/	
	gaAccountIdTest1: "UA-50387624-1", // chewinggun.net - frank.hsu

	gaAccountIdTest2: "UA-28254038-2", // chewinggun.net - frank.hsu

	gaAccountId: "UA-47307984-1", // cloud.sailtech.com

	/******** Recaptcha public and private key ********/
	recaptchaPublicKey: "6Lco-u0SAAAAAM_vZInahzRKgLZMmHN_zJII7QU5",

	recaptchaPrivateKey: "6Lco-u0SAAAAAASO_2mDmdc4aaHP2p4jFBa6hhZ9"


	/******** Develop environment ********/
	dev: {

		domainUrl : "https://chewinggun.net",

		/******** AppId and AppSecret of Facebook, twitter and google+ ********/	
		facebookAppKey: "191009537749511",
		
		facebookAppSecret: "bd632d3cae63b4ad4314a7238dd2aa19",
		
		twitterAppKey: "T9Ovg7MAiehY4XUPTfZzw",
		
		twitterAppSecret: "zcB3JUdQlCslW7546OdropON116vENwx84E0K8bloI",
		
		googleAppKey: "369163861143.apps.googleusercontent.com",
		
		googleAppSecret: "GjyzGopNhamfve2Ouhw9firR"

	},

	/******** Test environment ********/
	test: {

		domainUrl : "https://54.250.229.230",

		/******** AppId and AppSecret of Facebook, twitter and google+ ********/	
		facebookAppKey: "191009537749511",
		
		facebookAppSecret: "bd632d3cae63b4ad4314a7238dd2aa19",
		
		twitterAppKey: "T9Ovg7MAiehY4XUPTfZzw",
		
		twitterAppSecret: "zcB3JUdQlCslW7546OdropON116vENwx84E0K8bloI",
		
		googleAppKey: "369163861143.apps.googleusercontent.com",
		
		googleAppSecret: "GjyzGopNhamfve2Ouhw9firR"

	},

	/******** Production environment ********/
	prod: {

		domainUrl : "https://cloud.sailstech.com",

		/******** AppId and AppSecret of Facebook, twitter and google+ ********/	
		facebookAppKey: "191009537749511",
		
		facebookAppSecret: "bd632d3cae63b4ad4314a7238dd2aa19",
		
		twitterAppKey: "T9Ovg7MAiehY4XUPTfZzw",
		
		twitterAppSecret: "zcB3JUdQlCslW7546OdropON116vENwx84E0K8bloI",
		
		googleAppKey: "369163861143.apps.googleusercontent.com",
		
		googleAppSecret: "GjyzGopNhamfve2Ouhw9firR"

	}

}

var dev = {


}

var test = {



}


var prod = {



}



// Get enviroment argument
var arguments = process.argv,
	env = "";	
if(arguments.length > 2)
	env = arguments[2]; // use second arguments
console.log("Set enviroment >>> " + env);


module.exports = {
	
	domainUrl : "https://cloud.sailstech.com",

	/******** Main resource folder  ********/		
	resourcePath : "./resource/",

	/******** Folder path of Building and floor files  ********/
	imagePath : "public/client-image",
	
	mapInfoPath: "resource/map-info",

	/******** Download sdk, online doc and sample code path ********/

	sailsResPath: "resource/sails-relative-res",

	androidDocPath: "resource/sails-relative-res/android/Javadoc.rar",		

	iosDocPath: "resource/sails-relative-res/ios/doc.rar",		
		
	defaultAndroidSdkVersion: 1.2,

	defaultIosSdkVersion: 1.2,


	/******** Main sample building folder  ********/		
	sampleBuildingPath: "resource/map-info/Sample",

	/******** AppId and AppSecret of Facebook, twitter and google+ ********/	
	facebookAppKey: "191009537749511",
	
	facebookAppSecret: "bd632d3cae63b4ad4314a7238dd2aa19",
	
	twitterAppKey: "T9Ovg7MAiehY4XUPTfZzw",
	
	twitterAppSecret: "zcB3JUdQlCslW7546OdropON116vENwx84E0K8bloI",
	
	googleAppKey: "369163861143.apps.googleusercontent.com",
	
	googleAppSecret: "GjyzGopNhamfve2Ouhw9firR",

	/******** Default cookie duration ********/		
	defaultCookieDuration: 604800, // 7 days: 604800 <=> 60 * 60 * 24 * 7

	/******** Default token duration ********/	
	defaultTokenDuration: 86400, // 1 day: 86400 <=> 60 * 60 * 24
	
	/******** Max number of building count ********/	
	maxBuildingNumberOfUser: 50,

	/******** Max number of floor count ********/	
	maxFloorNumber: 100,
	maxBasementNumber: 20,

	/******** Pagination offset per page ********/	
	pageOffset: 30,

	/******** Google Analystic Relative ********/	
	gaAccountIdTest1: "UA-50387624-1", // chewinggun.net - frank.hsu

	gaAccountIdTest2: "UA-28254038-2", // chewinggun.net - frank.hsu

	gaAccountId: "UA-47307984-1", // cloud.sailtech.com

	/******** Recaptcha public and private key ********/
	recaptchaPublicKey: "6Lco-u0SAAAAAM_vZInahzRKgLZMmHN_zJII7QU5",

	recaptchaPrivateKey: "6Lco-u0SAAAAAASO_2mDmdc4aaHP2p4jFBa6hhZ9"

};
