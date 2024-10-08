const { fetchRunsByGroup, fetchRunsById, fetchRunsByUserId, fetchUpcomingRunForGroup, createRun, createUserAttendingRun, updateRunById, removeRunById, removeUserAttendingRunById } = require("../models/runs_model")
const moment = require('moment');

exports.getRunsByGroup = (req, res, next) => {
    const { group_id } = req.params;
    const { future_runs, user_id } = req.query; // Fetch future_runs and user_id values from query parameters

    // Validate group_id before database call
    if (isNaN(group_id)) {
        return res.status(400).send({ message: 'Bad Request' });
    }
    
    fetchRunsByGroup(group_id, future_runs, user_id).then((runs) => {
        res.status(200).send({ runs });
    })
    .catch((err) => {
        next(err);
    });
};

exports.getRunById = (req, res, next) => {
    const {run_id} = req.params
    // Validate group_id before database call
    if (isNaN(run_id)) {
        return res.status(400).send({ message: 'Bad Request' });
    }
    
    fetchRunsById(run_id).then((run) => {
        res.status(200).send(run)
    })
    .catch((err) => {
        next(err)
    })
}

exports.getRunsByUser = (req, res, next) => {
    const { user_id } = req.params;
    const { future_runs } = req.query;

    // Validate user_id before database call
    if (isNaN(user_id)) {
        return res.status(400).send({ message: 'Bad Request' });
    }

    fetchRunsByUserId(user_id, future_runs).then((runs) => {
        res.status(200).send({ runs });
    })
    .catch((err) => {
        next(err);
    });
};

exports.getUpcomingRunForGroup = (req, res, next) => {
    const { group_id } = req.params;

    // Validate group_id before database call
    if (!group_id) {
        return res.status(400).send({ message: 'Bad Request' });
    }

    fetchUpcomingRunForGroup(group_id).then((upcomingRun) => {
        res.status(200).send({ upcomingRun });
    })
    .catch((err) => {
        next(err);
    });
}

exports.postRun = (req, res, next) => {
    const newRun = req.body;

    createRun(newRun)
        .then((run) => {
            res.status(201).send({ run });
        })
        .catch((err) => {
            next(err);
        });
};

exports.postUserAttendingRun = (req, res, next) => {
    const newUserRun = req.body;

    createUserAttendingRun(newUserRun)
        .then((userRun) => {
            res.status(201).send({ userRun });
        })
        .catch((err) => {
            next(err);
        });
};

exports.patchRun = (req, res, next) => {
    const { run_id } = req.params;
    const updates = req.body;

    // Validate run_id before database call
    if (isNaN(run_id)) {
        return res.status(400).send({ message: 'Bad Request' });
    }

    // Validate the date format
    if (updates.date && !moment(updates.date, "YYYY-MM-DD", true).isValid()) {
        return res.status(400).send({ message: 'Bad Request: Invalid date format' });
    }

    // Pass run_id and updates to the model
    updateRunById(run_id, updates)
        .then((updatedRun) => {
            if (!updatedRun) {
                return res.status(404).send({ message: 'Run not found!' });
            }
            if (updatedRun.status==400) {
                return res.status(400).send({ message: 'Bad Request: No information was changed'})
            }
            res.status(200).send({ run: updatedRun });
        })
        .catch((err) => {
            next(err);
        });
};

exports.deleteRun = (req, res, next) => {
    const { run_id } = req.params;

    // Validate user_id before database call
    if (isNaN(run_id)) {
        return res.status(400).send({ message: 'Bad Request' });
    }

    removeRunById(run_id)
        .then((deletedRun) => {
            res.status(200).send({ message: 'Run successfully deleted', un: deletedRun });
        })
        .catch((err) => {
            next(err);
        });
};

exports.deleteUserAttendingRun = (req, res, next) => {
    const { user_id, run_id } = req.params;

    // Validate user_id and run_id before database call
    if (isNaN(user_id) || isNaN(run_id)) {
        return res.status(400).send({ message: 'Bad Request: Invalid user_id or run_id' });
    }

    removeUserAttendingRunById(user_id, run_id)
        .then((deletedUserRun) => {
            if (!deletedUserRun) {
                return res.status(404).send({ message: 'User or Run not found!' });
            }
            res.status(200).send({ message: 'User removed from run successfully', userRun: deletedUserRun });
        })
        .catch((err) => {
            next(err);
        });
};
