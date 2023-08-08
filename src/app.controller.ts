import { Controller, Get, Post,Body,UsePipes,ValidationPipe, Put, Param,NotFoundException, Delete,BadRequestException,UnauthorizedException, UseGuards,Req } from '@nestjs/common';
import { AppService } from './app.service';
import { UsuarioDto } from './usuarioDto';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { jwtConstants } from './constants';
import { AuthGuard } from './auth.guard';



const usuariosArr: UsuarioDto[] = [];
let contador = 1;
const jwtSecret = '1234';


@Controller('usuarios')
export class AppController {
  constructor(private readonly appService: AppService,private readonly jwtService: JwtService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  crearUsuario(@Body() usuario: UsuarioDto) {

    const existeUsuario = usuariosArr.find(u => u.nombre === usuario.nombre);
    if (existeUsuario) throw new NotFoundException('Ya existe el usuario');
    
    usuario.id = contador++;
    usuariosArr.push(usuario);
    return 'Usuario creado: ' + usuario.id + ' ' + usuario.nombre + ' . Contraseña: ' + usuario.contraseña
  }

  @Get()
  obtenerUsuarios() {
    return usuariosArr;
  }
  @Get(':id')
  getUsuarioPorId(@Param('id') id: number) {
    const usuario = usuariosArr.find(u => u.id == id);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    return usuario;
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  actualizarUsuario(@Param('id') id: number, @Body() usuarioActualizado: UsuarioDto,@Req() request:any) {
    
    const usuarioExistente = usuariosArr.find((usuario) => usuario.id == id);
    const usuarioActualizadoExiste = usuariosArr.find((usuario) => usuario.nombre == usuarioActualizado.nombre);

    if (!usuarioExistente) throw new NotFoundException('Usuario no encontrado');

    if (!usuarioActualizadoExiste || usuarioActualizado.nombre === usuarioExistente.nombre) {
      if (usuarioActualizado.nombre) usuarioExistente.nombre = usuarioActualizado.nombre;
      if (usuarioActualizado.contraseña) usuarioExistente.contraseña = usuarioActualizado.contraseña;

      return 'Usuario actualizado exitosamente';
    }

    throw new BadRequestException('Ya existe un usuario con ese nombre');
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  eliminarUsuario(@Param('id') id: number) {
    const index = usuariosArr.findIndex(usuario => usuario.id == id);
    if (index === -1) throw new NotFoundException('El usuario no fue encontrado');

    usuariosArr.splice(index, 1);
    return 'Usuario eliminado exitosamente';
  }

  @Post('login')
  async login(@Body() usuarioLogin: UsuarioDto) {
    const usuario = usuariosArr.find(u => u.nombre === usuarioLogin.nombre && u.contraseña === usuarioLogin.contraseña);

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: usuario.nombre };
    const access_token = jwt.sign(payload, jwtConstants.secret, { expiresIn: '1h' });

    return { access_token };
  }
}
