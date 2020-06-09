const { v4 } = require('uuid');
const { saveCube } = require('../controllers/database');
<<<<<<< Updated upstream
=======

const databaseFile = path.join(__dirname,'..', '/config/database.json');
>>>>>>> Stashed changes

class Cube {
    constructor(name, description, imageUrl, difficulty) {
        this.id = v4();
        this.name = name || "No Name";
        this.description = description;
        this.imageUrl = imageUrl || "placeholder";
        this.difficulty = difficulty || 0;
    }

    save(callback) {
        const newCube = {
            id: this.id,
            name: this.name,
            description: this.description,
            imageUrl: this.imageUrl,
            difficulty: this.difficulty
        }

<<<<<<< Updated upstream
        saveCube(newCube, callback);
=======
        saveCube(newCube);
>>>>>>> Stashed changes
    }
}

module.exports = Cube;