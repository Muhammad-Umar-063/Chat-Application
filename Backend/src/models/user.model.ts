import mongo from 'mongoose';

const userSchema = new mongo.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        sparse: true
    },
    profilePic: {
        type: String,
        default: ""
    }
    },
    { timestamps: true }
)


const User = mongo.model("User", userSchema)
export default User;