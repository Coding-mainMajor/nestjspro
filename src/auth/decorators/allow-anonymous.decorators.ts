export const AllowAnonymous = () => {
  return (
    target: any,
    propertyKey: string,
    propertyDescriptor: PropertyDescriptor,
  ) => {
    console.log('the allow anonymous decorator is called!:' + propertyKey);
  };
};
