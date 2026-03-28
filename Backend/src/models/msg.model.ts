import mongo from 'mongoose';

const msgSchema = new mongo.Schema({
    senderId: {
        type: mongo.Schema.Types.ObjectId,
        ref : 'User',
        required: true
    },
    receiverId: {
        type: mongo.Schema.Types.ObjectId,
        ref : 'User',
        required: true
    },
    text : {
        type : String
    },
    image : {
        type : String
    }
}, { timestamps: true })

const Msg = mongo.model("Msg", msgSchema)
export default Msg;