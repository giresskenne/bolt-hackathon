import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  name: {
    type: String,
    trim: true
  },
  subscription: {
    status: {
      type: String,
      enum: ['active', 'inactive', 'trial'],
      default: 'inactive'
    },
    planId: String,
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    trialEnds: Date
  },
  apiKey: {
    type: String,
    unique: true,
    sparse: true
  },
  usageQuota: {
    type: Number,
    default: 100 // Free tier quota
  },
  usageCount: {
    type: Number,
    default: 0
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate API key method
userSchema.methods.generateApiKey = function() {
  this.apiKey = uuidv4();
  return this.apiKey;
};

const User = mongoose.model('User', userSchema);
export default User;
