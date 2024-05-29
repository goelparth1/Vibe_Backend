
// interface ApiResponseInterface<T> {
//  success : boolean ; 
//  message : string ;
//  statusCode : number ;
//  data : T ;
// }

class ApiResponse<T>{
    success : boolean ;
    constructor( 
      public message : string = " Req was successful " ,
      public statusCode : number = 200 , 
      public data : T,
    ){
    this.success = true;
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
    }
}

export default ApiResponse;