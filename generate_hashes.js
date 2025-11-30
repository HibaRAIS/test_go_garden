const bcrypt = require('bcryptjs');

async function generateHashes() {
    const adminPass = 'admin123';
    const memberPass = 'member123';

    const adminHash = await bcrypt.hash(adminPass, 10);
    const memberHash = await bcrypt.hash(memberPass, 10);

    console.log(`ADMIN_HASH=${adminHash}`);
    console.log(`MEMBER_HASH=${memberHash}`);
}

generateHashes();
