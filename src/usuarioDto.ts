import { IsNotEmpty } from 'class-validator';

export class UsuarioDto {

  
  id: number;
  
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  contraseña: string;
}
