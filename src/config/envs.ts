import 'dotenv/config';

import * as joi from 'joi';

interface EnvVars {
  DB_HOST: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_PORT: number;
  PORT: number;

  JWT_SECRET: string;
  SECRET_KEY: string;

  RVIA_PATH: string;
  PROJECTS_PATH: string;
}

const envsSchema = joi.object({
  DB_HOST: joi.string().required(),
  DB_USERNAME: joi.string().required(),
  DB_PASSWORD: joi.string().required(),
  DB_NAME: joi.string().required(),
  DB_PORT: joi.number().required(),
  PORT: joi.number().required(),
  JWT_SECRET: joi.string().required(),
  SECRET_KEY: joi.string().required(),
  RVIA_PATH: joi.string().required(),
  PROJECTS_PATH: joi.string().required(),
})
.unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
});

if ( error ) {
  throw new Error(`Config validation error: ${ error.message }`);
}

const envVars:EnvVars = value;

export const envs = {
  dbHost: envVars.DB_HOST,
  dbUsername: envVars.DB_USERNAME,
  dbPassword: envVars.DB_PASSWORD,
  dbName: envVars.DB_NAME,
  dbPort: envVars.DB_PORT,
  port: envVars.PORT,

  jwtSecret: envVars.JWT_SECRET,
  secretKey: envVars.SECRET_KEY,

  rvia_path: envVars.RVIA_PATH,
  projects_path: envVars.PROJECTS_PATH,
};