import HttpException from './http.exception';

class Error401Exception extends HttpException {
  constructor() {
    super(401, "You're not authorized");
  }
}

export default Error401Exception;
