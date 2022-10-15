/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiConfiguration } from './api-configuration';
import { WebApiResponse } from './models/apiResponse';

/**
 * Base class for services
 */
@Injectable()
export class BaseService {
  constructor() {
  }

  handError<T>(error) {
    //Si es una rpta del back
    if (error.error.errors) {
      let errorResponse: WebApiResponse<T> = error.error
      errorResponse.response = {
        data: []
      };
      return errorResponse
    } else {
      //Si es un error de conexion
      let errorResponse: WebApiResponse<T> = {
        success: false,
        response: {
          data: []
        },
        errors: [
          { code: 500, message: 'Se ha perdido la comunicación con el servidor.' }
        ]
      }
      return errorResponse
    }
  }
}
