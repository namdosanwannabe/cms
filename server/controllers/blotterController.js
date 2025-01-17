import db from "../config/database.js";

export const getAllBlotters = async (req, res) => {
    const { id } = req.params;
    const sql = "CALL GetAllBlotters(?)";

    try {
        const results = await new Promise((resolve, reject) => {
            db.query(sql, [id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        res.json(results[0]);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            error: "Failed to retrieve blotter data",
            details: error.message,
        });
    }
};

export const getBlottersById = async (req, res) => {
    const { id } = req.params;
    const sql = "CALL GetBlotter(?)";

    try {
        const results = await new Promise((resolve, reject) => {
            db.query(sql, [id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
        res.json(results[0]);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            error: "Failed to retrieve blotter data",
            details: error.message,
        });
    }
};


// export const addBlotter = async (req, res) => {
//     const {
//         incident_date,
//         reporter_id,
//         complainant_id,
//         respondent_id,
//         witnesses,
//         incident_type,
//         incident_location,
//         incident_description,
//         resolution,
//         notes,
//         barangay_id,
//         defendants, // array of defendants
//     } = req.body;

//     console.log(req.body);
//     if (
//         !complainant_id ||
//         !defendants?.length
//     ) {
//         return res
//             .status(400)
//             .json({ message: "Please fill in all required fields." });
//     }

//     const blotterSql = `
//         INSERT INTO cbs_blotters 
//         (incident_date, reporter_id, complainant_id, respondent_id, witnesses, 
//          incident_type, incident_location, incident_description, resolution, notes, barangay_id)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     try {
//         await db.beginTransaction();

//         const blotterValues = [
//             incident_date || null,
//             reporter_id || 13,
//             complainant_id || null,
//             respondent_id || 9,
//             witnesses || "Tambay",
//             incident_type || null,
//             incident_location || "Sa Kanto",
//             incident_description || "Ninakaw ang aso",
//             resolution || "Sample",
//             notes || null,
//             barangay_id,
//         ];

//         // Insert into `cbs_blotters` and get `insertId`
//         const result = await new Promise((resolve, reject) => {
//             db.query(blotterSql, blotterValues, (error, result) => {
//                 if (error) {
//                     reject(error);
//                 } else {
//                     resolve(result);
//                 }
//             });
//         });

//         const blotterId = result.insertId;
//         console.log("Blotter ID:", blotterId);

//         // Insert defendants into `cbs_defendants`
//         const defendantSql = `
//             INSERT INTO cbs_defendants (blotter_id, name, address, contact)
//             VALUES (?, ?, ?, ?)
//         `;

//         for (const defendant of defendants) {
//             const { name, address, contact } = defendant;
//             if (!name || !address || !contact) {
//                 throw new Error("Each defendant must have a name, address, and contact.");
//             }
//             await new Promise((resolve, reject) => {
//                 db.query(defendantSql, [blotterId, name, address, contact], (error) => {
//                     if (error) {
//                         reject(error);
//                     } else {
//                         resolve();
//                     }
//                 });
//             });
//         }

//         await db.commit();
//         res.status(201).json({ message: "Blotter record and defendants added successfully" });
//     } catch (error) {
//         await db.rollback();
//         console.error("Error adding blotter record:", error);
//         res.status(500).json({ message: "Failed to add blotter record" });
//     }
// };

export const addBlotter = async (req, res) => {
    try {
        const {
            incident_date,
            reporter_id,
            complainant_id,
            complainant_name,
            complainant_address,
            complainant_contact,
            defendants,
            defendantAddresses,
            defendantContacts,
            witnesses,
            incident_type,
            incident_location,
            incident_description,
            resolution,
            notes,
            barangay_id,
        } = req.body;

        const sql = `CALL AddBlotter(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            incident_date || null,
            reporter_id,
            complainant_name || null,
            complainant_address || null,
            complainant_contact || null,
            witnesses || null,
            incident_type || null,
            incident_location || null,
            incident_description || null,
            resolution || null,
            notes || null,
            JSON.stringify(defendants),
            JSON.stringify(defendantAddresses),
            JSON.stringify(defendantContacts),
            barangay_id
        ];

        const result = await new Promise((resolve, reject) => {
            db.query(sql, values, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });

        res.status(201).json({
            message: 'Blotter added successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add blotter', error });
    }
}

export const updateBlotter = async (req, res) => {
    const { id } = req.params;
    const {
        incident_type,
        complainant,
        respondent,
        incident_date,
        incident_location,
        incident_description,
        status,
    } = req.body;

    if (
        !incident_type ||
        !complainant ||
        !respondent ||
        !incident_date ||
        !incident_location
    ) {
        return res
            .status(400)
            .json({ message: "Please fill in all required fields." });
    }

    const sql = `
        UPDATE cbs_blotters
        SET incident_type = ?, complainant = ?, respondent = ?, 
            incident_date = ?, incident_location = ?, 
            incident_description = ?, status = ?
        WHERE id = ?
    `;

    try {
        const values = [
            incident_type,
            complainant,
            respondent,
            incident_date,
            incident_location,
            incident_description,
            status,
            id,
        ];

        const result = await db.query(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Blotter record not found" });
        }

        res.status(200).json({ message: "Blotter record updated successfully" });
    } catch (error) {
        console.error("Error updating blotter record:", error);
        res.status(500).json({ message: "Failed to update blotter record" });
    }
};

export const deleteBlotter = async (req, res) => {

    const { id } = req.params;
    console.log("Blotter Id:", id);
    try {
        const query = "CALL DeleteBlotter(?)";

        db.query(query, [Number(id)], (error, results) => {
            if (error) {
                console.error("Error deleting blotter record:", error);
                return res.status(500).json({ message: 'Error deleting blotter record' });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'blotter record not found' });
            }

            res.status(200).json({ message: 'blotter record deleted successfully' });
        });
    } catch (error) {
        console.error("Error deleting blotter record:", error);
        res.status(500).json({ message: "Failed to delete blotter record" });
    }
};

//Hearings
export const getAllBlotterHearing = async (req, res) => {
    const { id } = req.params;
    const sql = "CALL GetBlotterHearings(?)";

    try {
        const result = await new Promise((resolve, reject) => {
            db.query(sql, [id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            })
        });
        res.json(result[0]);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            error: "Failed to retrieve blotter hearings data",
            details: error.message,
        });
    }
}

export const getBlotterHearingById = async (req, res) => {
    const { id } = req.params;
    console.log(id);
    const sql = "SELECT * FROM cbs_blotter_hearings WHERE iid = ?;"

    try {
        const result = await new Promise((resolve, reject) => {
            db.query(sql, [id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            })
        });
        res.json(result[0]);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            error: "Failed to retrieve blotter hearings data",
            details: error.message,
        });
    }
};

export const getAllBlotterHearingStatuses = async (req, res) => {
    const sql = "SELECT * FROM cbs_hearing_statuses";

    try {
        const result = await new Promise((resolve, reject) => {
            db.query(sql, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        res.json(result);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            error: "Failed to retrieve blotter hearing statuses",
            details: error.message,
        });
    }
};

export const addBlotterHearings = async (req, res) => {
    try {
        const {
            blotter_id,
            hearing_date,
            attendees,
            remarks,
            status_id,
            official_id,
        } = req.body;

        const sql = `CALL AddBlotterHearing(?, ?, ?, ?, ?, ?)`;

        const values = [
            blotter_id,
            hearing_date || null,
            JSON.stringify(attendees),
            remarks || null,
            status_id || null,
            official_id || null,
        ];

        const result = await new Promise((resolve, reject) => {
            db.query(sql, values, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });

        res.status(201).json({
            message: 'Blotter hearing added successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add blotter hearing', error });
    }
}

export const updateBlotterHearing = async (req, res) => {
    const { id } = req.params;

    try {
        const {
            attendees,
            remarks,
            status_id,
            official_id,
        } = req.body;

        const sql = `CALL UpdateBlotterHearing(?, ?, ?, ?, ?)`;

        const values = [
            id,
            JSON.stringify(attendees),
            remarks || null,
            status_id || null,
            official_id || null,
        ];

        const result = await new Promise((resolve, reject) => {
            db.query(sql, values, (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            });
        });

        res.status(200).json({
            message: 'Blotter hearing updated successfully',
            result,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Failed to update blotter hearing',
            error: error.message,
        });
    }
};

export const deleteBlotterHearings = async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM cbs_blotter_hearings WHERE iid = ?';

        db.query(query, [id], (error, results) => {
            if (error) {
                console.error("Error deleting blotter hearing:", error);
                return res.status(500).json({ message: 'Error deleting blotter hearing' });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'blotter hearing not found' });
            }

            res.status(200).json({ message: 'blotter hearing deleted successfully' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete blotter hearing', error });
    }
}