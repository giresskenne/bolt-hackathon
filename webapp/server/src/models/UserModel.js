import bcrypt from 'bcryptjs';
import { getSupabase } from '../config/database.js';

export class UserModel {
  constructor(data = {}) {
    this.id = data.id;
    this.email = data.email;
    this.password = data.password;
    this.subscription = data.subscription || {
      plan: 'free',
      status: 'trial',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      trialEnds: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    };
    this.created_at = data.created_at || new Date().toISOString();
  }

  static async findOne(query) {
    const supabase = getSupabase();
    
    if (query.email) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', query.email)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data ? new UserModel(data) : null;
    }
    
    return null;
  }

  static async findById(id) {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data ? new UserModel(data) : null;
  }

  static async create(userData) {
    const supabase = getSupabase();
    
    // Check if user already exists
    const existingUser = await this.findOne({ email: userData.email });
    if (existingUser) {
      const error = new Error('Email already exists');
      error.status = 400;
      throw error;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const newUser = {
      email: userData.email,
      password: hashedPassword,
      subscription: userData.subscription || {
        plan: userData.plan || 'free',
        status: 'trial',
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        trialEnds: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      }
    };

    const { data, error } = await supabase
      .from('users')
      .insert([newUser])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new UserModel(data);
  }

  async save() {
    const supabase = getSupabase();
    
    if (this.id) {
      // Update existing user
      const { data, error } = await supabase
        .from('users')
        .update({
          email: this.email,
          password: this.password,
          subscription: this.subscription
        })
        .eq('id', this.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return new UserModel(data);
    } else {
      // This shouldn't happen as we use create() for new users
      throw new Error('Cannot save user without ID. Use UserModel.create() instead.');
    }
  }

  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      subscription: this.subscription,
      created_at: this.created_at
    };
  }
}

export default UserModel;