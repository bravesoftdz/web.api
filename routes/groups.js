
// GET /groups
router.get('/groups', authenticatable, function(request, response){

	UserService.findCurrentOrDie(request)

	// List all groups that the user in.
	.then(function(user){
		return GroupService.listForPlayerId(user.playerId);
	})

	// Response about it.
	.then(function(groups){
		return response.send(groups);
	})

	// Catch the error if any.
	.catch(function(error){
		return handleApiErrors(error, response);
	});
});

// POST /groups
router.post('/groups', authenticatable, function(request, response){

	if (validator.isNull(request.body.name)){
		return response.status(400).send({
			'message': 'الرجاء التأكّد من تعبئة اسم المجموعة.'
		});
	}

	var name = request.body.name;

	//
	UserService.findCurrentOrDie(request)

	// Add a group.
	.then(function(user){
		return GroupService.create({name: name, authorId: user.playerId});
	})

	// Response about it.
	.then(function(group){
		return response.status(201).send(group);
	})

	// Catch the error if any.
	.catch(function(error){
		return handleApiErrors(error, response);
	});
});

// GET /groups/:id
router.get('/groups/:id', authenticatable, function(request, response){

	if (!validator.isNumeric(request.params.id)){
		return response.status(400).send({
			'message': 'الرجء التأكّد من اختيار مجموعة صحيحة.',
		});
	}

	var id = request.params.id;

	UserService.findCurrentOrDie(request)

	// Find the given group.
	.then(function(user){
		return GroupService.findByIdForPlayerId(id, user.playerId);
	})

	// Response about it.
	.then(function(group){
		return response.send(group);
	})

	// Catch the error if any.
	.catch(function(error){
		return handleApiErrors(error, response);
	});

});

// PUT /groups/:id
// TODO: Validate if the user is an admin for the group.
router.put('/groups/:id', authenticatable, function(request, response){

	if (!validator.isNumeric(request.params.id)){
		return response.status(400).send({
			'message': 'الرجاء التأكّد من اختيار مجموعة صحيحة.',
		});
	}

	if (validator.isNull(request.body.name)){
		return response.status(400).send({
			'message': 'الرجاء التأكّد من تعبئة الحقول المطلوبة.',
		});
	}

	var id = request.params.id;
	var name = request.body.name;

	UserService.findCurrentOrDie(request)

	// Find the given group.
	.then(function(user){
		return GroupService.findByIdForPlayerId(id, user.playerId);
	})

	// Update the group with the specified parameters.
	.then(function(group){
		return GroupService.updateForId({name: name}, id);
	})

	// Response about it.
	.then(function(group){
		return response.send(group);
	})

	// Catch the error if any.
	.catch(function(error){
		return handleApiErrors(error, response);
	});
});

// PUT /groups/:id/leave
router.put('/groups/:id/leave', authenticatable, function(request, response){

	if (!validator.isNumeric(request.params.id)){
		return response.status(400).send({
			'message': 'الرجء التأكّد من اختيار مجموعة صحيحة.',
		});
	}

	var id = request.params.id;

	//
	UserService.findCurrentOrDie(request)

	//
	.then(function(user){
		return GroupService.leaveByIdForPlayerId(id, user.playerId);
	})

	// Response about it.
	.then(function(done){
		return response.status(204).send();
	})

	// Catch the error if any.
	.catch(function(error){
		return handleApiErrors(error, response);
	});
});

// DELETE /groups/:id
router.delete('/groups/:id', authenticatable, function(request, response){

	if (!validator.isNumeric(request.params.id)){
		return response.status(400).send({
			'message': 'الرجء التأكّد من اختيار مجموعة صحيحة.',
		});
	}

	// Set the id of the group.
	var id = request.params.id;

	//
	UserService.findCurrentOrDie(request)

	//
	.then(function(user){
		return GroupService.deleteByIdForPlayerId(id, user.playerId);
	})

	// Response about it.
	.then(function(done){
		return response.status(204).send();
	})

	// Catch the error if any.
	.catch(function(error){
		return handleApiErrors(error, response);
	});
});

// POST /groups/:id/players
router.post('/groups/:id/players', authenticatable, function(request, response){

	if (!validator.isNumeric(request.params.id) || validator.isNull(request.body.fullname) || !e164Format.test(request.body.e164formattedMobileNumber)){
		return response.status(400).send({
			'message': 'الرجاء التأكّد من توفّر المعلومات الكاملة الخاصّة باللاعب.',
		});
	}

	// Define variables to be used.
	var id = request.params.id;
	var fullname = request.body.fullname;
	var e164formattedMobileNumber = request.body.e164formattedMobileNumber;

	//
	UserService.findCurrentOrDie(request)

	//
	.then(function(user){
		return GroupService.checkIsPlayerIdAdminForIdsOrDie(user.playerId, [id]);
	})

	//
	.then(function(){
		console.log('GroupService.addPlayerToId is about to be called.', id);
		return GroupService.addPlayerToId({e164formattedMobileNumber: e164formattedMobileNumber, fullname: fullname}, id);
	})

	// Response about it.
	.then(function(playerGroup){
		console.log('response.status(201).send is about to be called.');
		return response.status(201).send(playerGroup);
	})

	// Catch the error if any.
	.catch(function(error){
		return handleApiErrors(error, response);
	});
});

// DELETE /groups/:id/players/:playerId
router.delete('/groups/:id/players/:playerId', authenticatable, function(request, response){

	if (!validator.isNumeric(request.params.id) || !validator.isNumeric(request.params.playerId)){
		return response.status(400).send({
			'message': 'الرجاء التأكّد من اختيار اللاعب الصحيح في المجموعة الصحيحة.',
		});
	}

	// Define variables to be used.
	var id = request.params.id; 
	var playerId = request.params.playerId;

	//
	UserService.findCurrentOrDie(request)

	//
	.then(function(user){
		return GroupService.deletePlayerIdByAdminPlayerIdInId(playerId, user.playerId, id);
	})

	// Response about it.
	.then(function(groupPlayer){
		return response.status(204).send();
	})

	// Catch the error if any.
	.catch(function(error){
		return handleApiErrors(error, response);
	});
});

// PUT /groups/:id/players/:playerId/adminize
router.put('/groups/:id/players/:playerId/adminize', authenticatable, function(request, response){

	if (!validator.isNumeric(request.params.id) || !validator.isNumeric(request.params.playerId)){
		return response.status(400).send({
			'message': 'الرجاء التأكّد من اختيار اللاعب الصحيح في المجموعة الصحيحة.',
		});
	}

	// Define variables to be used.
	var id = request.params.id; 
	var playerId = request.params.playerId;

	//
	UserService.findCurrentOrDie(request)

	//
	.then(function(user){
		return GroupService.adminizePlayerIdByAdminPlayerIdInId(playerId, user.playerId, id);
	})

	// Response about it.
	.then(function(groupPlayer){
		return response.status(204).send();
	})

	// Catch the error if any.
	.catch(function(error){
		return handleApiErrors(error, response);
	});
});
