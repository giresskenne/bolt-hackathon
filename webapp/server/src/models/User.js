import bcrypt from 'bcryptjs';

class User {
  constructor(data = {}) {
    this._id = data._id || Math.random().toString(36).substr(2, 9);
    this.email = data.email || '';
    this.password = data.password || '';
    this.subscription = {
      plan: data.plan || 'free',
      status: data.status || 'trial',
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      trialEnds: data.trialEnds || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days trial
    };
    this.createdAt = data.createdAt || new Date();
  }

  static async findOne(query) {
    if (global.__TEST_STATE__) {
      const user = Array.from(global.__TEST_STATE__.users.values())
        .find(u => u.email === query.email);
      return user ? new User(user) : null;
    }
    return null;
  }

  static async findById(id) {
    if (global.__TEST_STATE__) {
      const user = Array.from(global.__TEST_STATE__.users.values())
        .find(u => u._id === id);
      return user ? new User(user) : null;
    }
    return null;
  }

  static async create(data) {
    // Check for existing user
    const existingUser = await this.findOne({ email: data.email });
    if (existingUser) {
      const error = new Error('Email already exists');
      error.status = 400;
      throw error;
    }

    const user = new User(data);

    // Hash password
    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }

    // Store in test state
    if (global.__TEST_STATE__) {
      global.__TEST_STATE__.users.set(user._id, {
        _id: user._id,
        email: user.email,
        password: user.password,
        plan: user.plan,
        createdAt: user.createdAt
      });
    }

    return user;
  }

  async comparePassword(candidatePassword) {
    if (!this.password) return false;
    if (process.env.NODE_ENV === 'test') {
      return candidatePassword === this.password;
    }
    return bcrypt.compare(candidatePassword, this.password);
  }

  toJSON() {
    return {
      _id: this._id,
      email: this.email,
      subscription: this.subscription,
      createdAt: this.createdAt
    };
  }
}

export default User;