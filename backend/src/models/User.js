import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  displayName: String,
  photoURL: String,
  interests: [{
    type: String
  }],
  joinedRooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  }],
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

export default User;
