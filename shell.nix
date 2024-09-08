let
  pkgs = import <nixpkgs> {};
in pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs # Para ejecutar un servidor local de desarrollo si lo necesitas
    pkgs.emmet-ls # Completado de código para Emmet
  ];

  shellHook = ''
    echo "welcome to vanilla webdev shell
  '';
}