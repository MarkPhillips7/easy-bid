
Schema.Address = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  // Possibly multiple-line data representing street address with apartment number like this:
  // 150 Grayrock Dr
  // Suite B1
  addressLines: {
    type: String,
    optional: true
  },
  city: {
    type: String,
    optional: true,
    max: 50
  },
  state: {
    type: String,
    optional: true,
    regEx: /^A[LKSZRAEP]|C[AOT]|D[EC]|F[LM]|G[AU]|HI|I[ADLN]|K[SY]|LA|M[ADEHINOPST]|N[CDEHJMVY]|O[HKR]|P[ARW]|RI|S[CD]|T[NX]|UT|V[AIT]|W[AIVY]$/
  },
  zipCode: {
    type: String,
    optional: true,
    regEx: /^\d{5}$|^\d{5}-?\d{4}$/
  },
});
