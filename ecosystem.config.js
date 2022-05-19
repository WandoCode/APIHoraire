module.exports = {
  apps: [
    {
      script: "bin/www",
      watch: ".",
    },
  ],

  deploy: {
    production: {
      key: "C:/Users/Maxime/.ssh/id_rsa.pub",
      user: "root",
      host: "194.31.150.105",
      ref: "origin/main",
      repo: "git@github.com:Wandole/APIHoraire.git",
      path: "/root/horaireAPI",
      "pre-deploy-local": "",
      "post-deploy": "",
      "pre-setup": "",
    },
  },
};