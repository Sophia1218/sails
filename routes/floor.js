var log = require('log4js').getLogger(),
	utilityS = require("./utility.js"),		
	Ap = require("../model/ap"),
	ApToFloor = require("../model/apToFloor"),	
	Ad = require("../model/ad"),
	Store = require("../model/store"),
    Floor = require("../model/floor"),
    Building = require("../model/building"),
    fs = require('fs'),
	path = require('path'),
	mkdirp = require("mkdirp"),
    AdmZip = require('adm-zip'),
    rimraf = require('rimraf'),
	parseString = require('xml2js').parseString,
	config = require('../config/config');
	

// Static variable
var	errorResInfo = utilityS.errorResInfo,
	mapinfo_path = "/" + config.mapInfoPath,
	image_path = config.imagePath;

// GET Page of specific building
exports.show = function(req, res) {
	res.render("floor/floor-show.html");
};

// GET Interface for read specific floor
exports.read = function(req, res) {

	// Get floor
	Floor.findById(req.params._id, function(err, floor) {

		if (err)
			log.error(err);

		if (floor) {
			res.send(200, floor);
		}

	});

};

// GET Interface for list floors of specific building
exports.list = function(req, res) {

	Floor.find({

		buildingId: req.query.buildingId

	}).sort({layer: -1}).execFind(function(error, floors){

		if (error)
			log.error(error);

		res.send(200, floors);

	});

};

// POST Interface for create floor of building
exports.create = function(req, res) {

	if(req.body.buildingId && req.body.layer){

		Building.findById(req.body.buildingId, function(error, building){
			
			var layer;
			if(req.body.layer>0){
				building.upfloor = building.upfloor + 1;
				layer = building.upfloor;
			}else{
				building.downfloor =  building.downfloor + 1;
				layer = -(building.downfloor);				
			}

			building.save(function(err, building){
				
				if(err)
					log.error(err);
				
				if(building)
					new Floor({
	
						layer: layer,
	
						buildingId: req.body.buildingId
	
					}).save(function(error, floor){
	
							building.save(function(){
								res.send(200, floor);
							});
	
					});				
				
			});

		});		
		
	}

};

// POST Interface for update floor of building
exports.update = function(req, res) {

    if(req.body._id){

        // Get building
        Floor.findById(req.body._id, function(err, floor){

            if(err)
                log.error(err);

            if(floor){
                floor.name = req.body.name;
                floor.desc = req.body.desc;
                floor.save(function(){
                    res.send(200, floor);
                });
            }

        });

    }

};


// POST Interface for delete the floor, stores in this floor and ads of stores of this floor
exports.del = function(req, res){
	
	if(req.body._id){
				
		// Remove floor
		Floor.findById(req.body._id, function(err, floor){
			
			if(err)
				log.error(err);
			
			// Get all building's floors
			if(floor){
									
				Building.findById(floor.buildingId, function(err, building){
				
					if(err)
						log.error(err);
					
					if(building){
						
						var folderPath = path.dirname() + mapinfo_path + '/' + req.user._id + "/" + floor.buildingId;
													
						Floor.find({
							
							buildingId: floor.buildingId
							
						}, function(err, floors){
							
							if(err)
								log.error(err);
							
							
							// Remove removed floor folder if exist
							var removeFolderPath = folderPath + "/" + floor.layer;
							fs.exists(removeFolderPath, function(exist){
								
								// Delete the folder removed floor 
								if(exist)
									rimraf(removeFolderPath, function(err){
										if(err)
											log.error(err);
									});										
								
								// Reorder all floors in this building
								floors.forEach(function(ofloor){

									if(floor.layer > 0){
																	
										if(ofloor.layer > floor.layer){								
											
											// Change render and region folder
											var oldFolderPath = folderPath + "/" + ofloor.layer;
											ofloor.layer = ofloor.layer - 1;
											var newFolderPath = folderPath + "/" + ofloor.layer;
											ofloor.save();
																						
											// Rename foldr with new layer
											fs.exists(oldFolderPath, function (exist) {
												if(exist)
													fs.rename(oldFolderPath, newFolderPath, function(err) {
														if(err)
															log.error(err);
													});
											});										
											
										}							
																					
									}else{
										
										if(ofloor.layer < floor.layer){	
											
											// Change render and region folder
											var oldFolderPath = folderPath + "/" + ofloor.layer;
											ofloor.layer = ofloor.layer + 1;
											var newFolderPath = folderPath + "/" + ofloor.layer;
											ofloor.save();									
											
											// Rename foldr with new layer								
											fs.exists(oldFolderPath, function (exist) {
												if(exist)
													fs.rename(oldFolderPath, newFolderPath, function(err) {
														if(err)
															log.error(err);															
													});
											});	
											
										}
																											
									}
																		
								});									
								
								
							});
															
							// Update "upfloor" or "downfloor" attribute of building 
							if(floor.layer > 0)
								building.upfloor = building.upfloor - 1;										
							else
								building.downfloor = building.downfloor - 1;
							
							// Update mapzip of building
							building.save(function(err, building){
								
								// Repackage building's map zip file
								var zip = new AdmZip(),
						 			targetPath = req.user._id + "/" + building.id + "/map.zip";															
								fs.exists(folderPath, function (exist) {																				
									if(exist){
										
										// Start to package map.zip
										zip.addLocalFolder(folderPath);
										zip.writeZip(folderPath + "/map.zip");
										
										// Update mapzip info of building
										building.mapzip = targetPath;
										building.mapzipUpdateTime = new Date();				
										building.save();					
										
									}
								});											
								
							});								
							
							// Remove floor
							floor.remove(function(err){	
														
								if(err)
									log.error(err);
								else
									res.json(200, {
										_id: req.body._id
									});												
							});							
							
						});							
													
					}
					
				});
					
			}
			
		});			
		
		// Find all stores
		Store.find({
			
			floorId: req.body._id
			
		}, function(err, stores){
			
			if(err)
				log.error(err);
			
			for(var i=0; i<stores.length; i++){					
				
				// Find all ads
				Ad.find({
					
					storeId: stores[i].id
					
				}, function(err, ads){					
					
					if(err)
						log.error(err);
					
					for(var j=0; j<ads.length; j++){
						
						// Delete ad image if exist
						if(ads[j].image){
							var oldImgPathAd = path.resolve(image_path + "/" + ads[j].image);
							fs.unlink(oldImgPathAd, function(err){
								log.error(err);
							});	
						}
						
						// Remove ad
						ads[j].remove();						
						
					}
										
				});				
				
				// Delete store icon if exist
				if(stores[i].icon){
					var oldImgPath = path.resolve(image_path + "/" + stores[i].icon);
					fs.unlink(oldImgPath, function(err){
						log.error(err);
					});	
				}				
				
				// Remove store
				stores[i].remove();
				
			}		
			
		});
	
	}
		
};


// POST Interface for upload path.xml and map.xml
exports.uploadMapAndPath = function(req, res) {

	if(req.body._id && req.files.map){

	    Floor.findById(req.body._id, function(err, floor) {

	        // Get the temporary location of the file
	        var tmpPathPath = req.files.path ? req.files.path.path : null,
	            tmpPathMap = req.files.map.path;

	        // File path: /${USER._ID}/${BUILDING._ID}/${FLOOR._ID}
	        var webLocation = req.user._id + "/" + floor.buildingId + "/" + floor.layer,
	            folderPath = path.dirname() + mapinfo_path + '/' + webLocation;	        
            mkdirp(folderPath, function(err, dd) {
                if (err)
                    log.error(err);

                var targetPathPath = folderPath + "/path.xml",
                    targetPathMap = folderPath + "/map.xml";

                log.info("targetPathPath: " + targetPathPath);
                log.info("targetPathMap: " + targetPathMap);

                // Move file from temp to target
                fs.rename(tmpPathMap, targetPathMap, function(err) {

                    if (err){
                    	
                        log.error(err);
                        
                    }else{
                    	
                    	// Update map
                    	floor.map = webLocation + "/map.xml";
                        if(tmpPathPath){
                        	
                            fs.rename(tmpPathPath, targetPathPath, function(err) {

                                if (err)
                                    log.error(err);
                                
                                // Update floor
                                floor.path = webLocation + "/path.xml";                                
                                floor.lastXmlUpdateTime = new Date();                        
                                floor.save(function(err, floor) {

                                    if (err)
                                        log.error(err);

                                    if (floor)
                                        res.send(200, floor);

                                    // Delete temped path.xml
                                    fs.unlink(tmpPathPath, function(err){});

                                });

                            });                    	
                        	                    	
                        }else{
                        	
                        	// Update floor
                        	floor.lastXmlUpdateTime = new Date(); 
                            floor.save(function(err, floor) {

                                if (err)
                                    log.error(err);

                                if (floor)
                                    res.send(200, floor);

                                // Delete temped map.xml
                                fs.unlink(tmpPathMap, function(err){});

                            });
                            
                        }                    	
                    	
                    }
                    
                    // Delete temped map.xml
                    fs.unlink(tmpPathMap, function(err){});

                });

            });

	    });

	}

};

// POST Interface for upload render.xml and region.xml
exports.uploadRenderAndRegion = function(req, res) {

	if(req.body._id && req.files.render && req.files.region){

	    Floor.findById(req.body._id, function(err, floor) {

            // Get the temporary location of the file
            var tmpPathRender = req.files.render.path,
                tmpPathRegion = req.files.region.path;

            // File path: /${USER._ID}/${BUILDING._ID}/${FLOOR._ID}
            var webLocation = req.user._id + "/" + floor.buildingId + "/" + floor.layer,
                folderPath = path.dirname() + mapinfo_path + '/' + webLocation;

            mkdirp(folderPath, function(err, dd) {
                if (err)
                    log.error(err);

                var targetPathRender = folderPath + "/render.xml",
                    targetPathRegion = folderPath + "/region.xml";

                log.info("targetPathRender: " + tmpPathRender);
                log.info("targetPathRegion: " + tmpPathRegion);

                // Move file from temp to target
                fs.rename(tmpPathRender, targetPathRender, function(err) {

                    if (err){
                    	
                        log.error(err);
                        res.json(400, {
                        	msg: "Sever error " + err 
                        });
                        
                    }else{
                    	
	                    fs.rename(tmpPathRegion, targetPathRegion, function(err) {
	
	                        if (err)
	                            log.error(err);
	
	                        floor.render = webLocation + "/render.xml";
	                        floor.region = webLocation + "/region.xml";
	                        floor.save(function(err, floor) {
	
	                            if (err)
	                                log.error(err);
	
	                            if (floor)
	                                res.send(200, floor);
	
	                            // Start to parse region.xml
	                            fs.readFile(targetPathRegion, 'utf8', function (err, data) {
	
	                                if(err)
	                                  log.error(err);
	
	                                if(data)
	                                    parseRegion(data, req.body._id);
	
	                                // Delete the temporary file
	                                fs.unlink(tmpPathRender, function(err){});
	                                fs.unlink(tmpPathRegion, function(err){});
	                            });
	
	                        });
	
	                    });
	                    
                    }

                });

            });

	    });

	}

};


// Function for parse regions and create stores on these floor
function parseRegion(regionXMLString, floorId, next){
	
	parseString(regionXMLString, function (err, result) {
		
	    var ways = result.osm.way;
	    Store.find({
	    	
	    	floorId : floorId
	    	
	    }, function(err, stores){

	    	if(err)
	    		log.error(err);
	    	
	    	if(ways){
	    		
			    ways.forEach(function(way){
	
			    	var tags = way.tag;
			    	tags.forEach(function(tag){
	
			    		//console.log(tag.$);
			    		var tagInfo = tag.$;
			    		if(tagInfo.k == "label"){
	
			    			var name = tagInfo.v,
			    				isDuplicate = false;
			    			console.log(name);
	
			    			// Check is duplicate
			    			for(var i=0; i< stores.length; i++){
			    				if(name == stores[i].name){
			    					isDuplicate = true;
			    					break;
			    				}
			    			}
	
			    			if(!isDuplicate){
	
		    					Store.create({
	
		    						name: tagInfo.v,
		    						floorId: floorId
	
		    					}, function(error, store){
		    						if(error)
		    							log.error(error);
	
		    						if(store)
		    							log.info("Create new store " + name + " successfully");
		    					});
	
			    			}else{
	
			    				log.info("Duplicate store name " + name);
	
			    			}
	
			    		}
	
			    	});
	
			    });

	    	}
	    	
	    });


	});

}

// GET Interface for get mapzip file of specific building
exports.getMapzip = function(req, res){
	
    if(req.query.mapzip){

        try{
        	
            var fileName = req.query.mapzip,
            	filePath = path.dirname() + "/" + config.mapInfoPath + '/' + fileName,
            	stat = fs.statSync(filePath);            
            res.writeHead(200, {
                "Content-type": "application/octet-stream",
                "Content-disposition": "attachment; filename=mapzip",
                "Content-Length": stat.size
            });

            var readStream = fs.createReadStream(filePath);

            // We replaced all the event handlers with a simple call to util.pump()
            readStream.pipe(res);

        }catch(e){

            log.error(e);
            res.json(400, {
            	msg: "file doesn't exist"
            });            

        }
        
    }

};

// GET Interface for get region.xml
exports.getFile = function(req, res){
	
	if(req.query.map || req.query.path || req.query.render || req.query.region){
		
		// Get file name
		var fileName, resFileName;
		if(req.query.map){			
			fileName = req.query.map;
			resFileName = "map.xml";			
		}else if(req.query.path){			
			fileName = req.query.path;
			resFileName = "path.xml";
		}else if(req.query.render){			
			fileName = req.query.render;
			resFileName = "render.xml";						
		}else{			
			fileName = req.query.region;
			resFileName = "region.xml";						
		}
        var filePath = path.dirname() + "/" + config.mapInfoPath + '/' + fileName;
        try{
        	
	        var stat = fs.statSync(filePath);
            res.writeHead(200, {
                "Content-type": "application/octet-stream",
                "Content-disposition": "attachment; filename=" + resFileName,
                "Content-Length": stat.size
            });

            var readStream = fs.createReadStream(filePath);

            // We replaced all the event handlers with a simple call to util.pump()
            readStream.pipe(res);

        }catch(e){
        	
            log.error(e);
            res.json(400, {
            	msg: "file doesn't exist"
            });

        }		
		
	}	
	
};

// POST Interface for upload mapzip
exports.uploadMapzip = function(req, res) {
	
    if(req.body._id && req.files.mapzip){

        // Get file name and extension
        var fileName = req.files.mapzip.name,
            extension = path.extname(fileName).toLowerCase() === '.zip' ? ".zip" : null ||
                        path.extname(fileName).toLowerCase() === '.rar' ? ".rar" : null;

        // Check file format by extension
        if(extension){

            // Get floor
            Floor.findById(req.body._id, function(err, floor) {

                if(err)
                    log.error(err);

                if(floor){

                    // Get the temporary location of the file
                    var tmpPath = req.files.mapzip.path;

                    // File path: /${USER._ID}/${BUILDING._ID}/${FLOOR._ID}
                    var webLocation = req.user._id + "/" + floor.buildingId + "/" + floor.layer,
                        folderPath = path.dirname() + mapinfo_path + '/' + webLocation;

                    mkdirp(folderPath, function(err, dd) {

                        var targetPath = folderPath + "/map" + extension;
                        fs.rename(tmpPath, targetPath, function(err) {

                            if (err)
                                log.error(err);

                            floor.mapzip = webLocation + "/map" + extension;
                            floor.save(function(err, floor) {

                                if (err)
                                    log.error(err);

                                if (floor)
                                    res.send(200, floor);

                                // Delete the temporary file
                                fs.unlink(tmpPath, function(err){});

                            });

                        });

                    });

                }

            });

        }else{

            res.send(200, { msg: "File extension should be .zip or .rar." });
        }

    }

};


// Post Interface for upload applist.xml
exports.uploadApplist = function(req, res) {
	
	if(req.body.floorId && req.files.applist){
		
		var fileName = req.files.applist.name, 
			extension = path.extname(fileName).toLowerCase() === '.xml' ? ".xml" : null;
		
		// Check file type		
		if (extension) {
			
			Floor.findById(req.body.floorId, function(err, floor){
				
				if(err){
					
					log.error(err);
					
					// Internal server error
					res.send(errorResInfo.INTERNAL_SERVER_ERROR.code, {
						msg: errorResInfo.INTERNAL_SERVER_ERROR.msg 
					});				
					
				}else{
									
					if(floor){
				        	
				        // File path: /${USER._ID}/${BUILDING._ID}/${FLOOR._ID}
				        var webLocation = req.user._id + "/" + floor.buildingId + "/" + floor.layer,
				            folderPath = path.dirname() + mapinfo_path + '/' + webLocation;
				        
				        mkdirp(folderPath, function(err, dd) {
				            
				        	if (err){
				        		
				                log.error(err);
				                
								// Internal server error
								res.send(errorResInfo.INTERNAL_SERVER_ERROR.code, {
									msg: errorResInfo.INTERNAL_SERVER_ERROR.msg 
								});					        		
				        		
				        	}else{
				        		
					            var tmpPathAppList = req.files.applist.path,					        	
					            	targetPathAppList = folderPath + "/applist.xml";

					            log.info("targetPathAppList: " + targetPathAppList);

					            // Move file from temp to target
					            fs.rename(tmpPathAppList, targetPathAppList, function(err) {

					                if (err){
					                	
						                log.error(err);
						                
										// Internal server error
										res.send(errorResInfo.INTERNAL_SERVER_ERROR.code, {
											msg: errorResInfo.INTERNAL_SERVER_ERROR.msg 
										});	
					                    
					                }else{
				                        	
				                        floor.applist = webLocation + "/applist.xml";
				                        floor.save(function(err, floor) {

				                            if(err){
				                            	
								                log.error(err);										                
								                
												// Internal server error
												res.send(errorResInfo.INTERNAL_SERVER_ERROR.code, {
													msg: errorResInfo.INTERNAL_SERVER_ERROR.msg 
												});	
				                            							                            	
				                            }else{
				                            	
				                            	// Response success to client first						                            	
												res.json(errorResInfo.SUCCESS.code, floor);
												
					                            // Start to parse region.xml
					                            fs.readFile(targetPathAppList, 'utf8', function (err, data) {

					                                if(err)
					                                  log.error(err);
					                                
					                                if(data)
					                                    parseApplist(data, floor.id);

					                                // Delete the temporary file
					                                fs.unlink(tmpPathAppList, function(err){});
					                                
					                            });						                            	
				                            							                            	
				                            }						                              

				                        });					                        	
					                    
					                }

					            });				        	
				        						        		
				        	}

				        });			        														
						
					}else{
						
						// floorId is not correct
						res.send(errorResInfo.INCORRECT_PARAMS.code, {
							msg: errorResInfo.INCORRECT_PARAMS.msg 
						});						
						
					}		        
								
				}
					
			});					
						
		}else{

			// file is not xml type
			res.send(errorResInfo.INCORRECT_FILE_TYPE.code, {
				msg : errorResInfo.INCORRECT_FILE_TYPE.msg + " - applist have to be .xml format"
			});

		}			
				
	}else{
		
		// params is incorrect
		res.send(errorResInfo.INCORRECT_PARAMS.code, {
			msg: errorResInfo.INCORRECT_PARAMS.msg 
		});
		
	}

};


// Function for parse applist.xml file
function parseApplist(applistXMLString, floorId){
	
	parseString(applistXMLString, function (err, result) {
		
		if(err){
			
			log.error(err);
			
		}else{
			
			try{
				
			    var aps = result.WiFiAPList && result.WiFiAPList.ap;
			    aps.forEach(function(ap){
			    	
			    	var tap = ap.$;
			    	
			    	// Create new ap
			    	Ap.findOne({
			    		
			    		apId: tap.id
			    		
			    	}, function(err, apo){
			    		
			    		if(err)
			    			log.error(err);
			    		
			    		if(apo){
			    						    			
			    			// Update ap
			    			apo.ssid = tap.ssid;
			    			apo.maxholdpwd = tap.maxholdpwd;
			    			apo.save(function(err, apObj){
			    				
			    				if(err)
			    					log.error(err);
			    				
			    				if(apObj)			    					
			    					updateRelationBetweenApAndFloor(apObj.apId, floorId);
			    				
			    			});
			    			
			    		}else{
			    			
			    			// Create new ap
					    	new Ap({
						    	
					    		apId: tap.id,			    		
					    		ssid: tap.ssid,			    		
					    		maxholdpwd: tap.maxholdpwd
					    		
					    	}).save(function(err, apObj){
					    		
					    		if(err)
					    			log.error(err);
					    			
					    		if(apObj)
					    			updateRelationBetweenApAndFloor(apObj.apId, floorId);
					    		
					    	});			    			
			    			
			    		}
			    					    		
			    	});
			    				    	
			    });				
				
			}catch(e){				
				
				log.error(e);
				
			}			
			
		}

	});	
	
}

// Function for update relation between app and floor
function updateRelationBetweenApAndFloor(apId, floorId){
	
	ApToFloor.findOne({
		
		apId: apId,
		floorId: floorId
		
	}, function(err, apToFloor){
		
		if(err)
			log.error(err);
		
		if(!apToFloor){
			
			// Create relation between building and ap
			new ApToFloor({
			
				apId: apId, // the attribute "apId" of ap(ap.appId not ap.id) 
				
				floorId: floorId			    							    				
				
			}).save(function(err, apToFloor){
			
				if(err)
					log.error(err.message);
				
			});							
			
		}
				
	});	
	
}
