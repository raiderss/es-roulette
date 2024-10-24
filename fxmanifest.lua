fx_version "adamant"

game "gta5"

client_script { 
"client/*.lua"
}

server_script {
"server/*.lua",
} 

shared_script {
"shared.lua"
}


ui_page "index.html"

files {
    'index.html',
    'vue.js',
    'assets/**/*.*',
    'assets/font/*.otf',  
}

lua54 'yes'
-- dependency '/assetpacks'