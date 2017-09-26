export const cleanUser = (user) => {
  if (user.lastName === undefined) {
    user.lastName = '';
  }
  if (user.address && user.address.addressLines === undefined) {
    user.address.addressLines = '';
  }
  if (user.address && user.address.city === undefined) {
    user.address.city = '';
  }
  if (user.address && user.address.state === undefined) {
    user.address.state = '';
  }
  if (user.address && user.address.zipCode === undefined) {
    user.address.zipCode = '';
  }
  if (user.phoneNumber === undefined) {
    user.phoneNumber = '';
  }
  if (user.notes === undefined) {
    user.notes = '';
  }
  return user;
};

export const emptyFormUser = {
  emailAddress: '',
  firstName: '',
  lastName: '',
  address: {
    addressLines: '',
    city: '',
    state: '',
    zipCode: ''
  },
  phoneNumber: '',
  notes: ''
};

UsersHelper = {
  cleanUser,
  emptyFormUser,
};
