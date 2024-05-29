
class ApiError<T> extends Error {
    success : boolean ;
    constructor( 
        public message : string = " Req was unsuccessful " ,
        public statusCode : number = 400 , 
        public data : T, 
        public stack : string = "",
        ){
            super ( message );
            this.success = false;
            this.statusCode = statusCode;
            this.data = data;

         if(stack){
            this.stack = stack ;
         }else {
            Error.captureStackTrace(this, ApiError);
         }
      
        }
    
};

export default ApiError;