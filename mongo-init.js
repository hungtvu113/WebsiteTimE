// MongoDB initialization script
// Tạo database và user cho ứng dụng QLTime

db = db.getSiblingDB('qltime');

// Tạo user cho database qltime
db.createUser({
  user: 'qltime_user',
  pwd: 'qltime_password',
  roles: [
    {
      role: 'readWrite',
      db: 'qltime'
    }
  ]
});

// Tạo các collection cơ bản
db.createCollection('users');
db.createCollection('tasks');
db.createCollection('projects');
db.createCollection('categories');
db.createCollection('timeblocks');
db.createCollection('preferences');
db.createCollection('notes');
db.createCollection('chathistories');

print('Database qltime đã được khởi tạo thành công!');
