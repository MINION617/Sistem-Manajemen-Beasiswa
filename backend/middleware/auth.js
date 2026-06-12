const supabase = require('../lib/supabase');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Find user in MySQL
    const mysqlUser = await User.findOne({
      where: { supabase_id: user.id }
    });

    if (!mysqlUser) {
      return res.status(403).json({ message: 'User not found in local database' });
    }

    req.user = mysqlUser;
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = authMiddleware;
