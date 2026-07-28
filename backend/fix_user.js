const bcrypt = require('bcryptjs');
const db = require('./src/config/database');

async function fixPassword() {
  try {
    const plainPassword = '123456';
    const email = 'daniel@gmail.com';

    // Generar el hash real de 123456
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    console.log('📌 Nuevo Hash Generado:', hashedPassword);

    // Actualizar en MySQL
    const [result] = await db.query(
      'UPDATE usuarios SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );

    if (result.affectedRows > 0) {
      console.log('✅ ¡Contraseña de daniel@gmail.com actualizada exitosamente a 123456!');
    } else {
      console.log('⚠️ No se encontró al usuario daniel@gmail.com para actualizar.');
    }
  } catch (error) {
    console.error('❌ Error al actualizar:', error);
  } finally {
    process.exit();
  }
}

fixPassword();