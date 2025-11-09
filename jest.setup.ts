// ensure a predictable admin secret during tests
process.env.ADMIN_SECRET = process.env.ADMIN_SECRET ?? 'testsecret'
