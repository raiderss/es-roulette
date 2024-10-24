Config = {
    Framework = 'QBCore',  -- QBCore or ESX or OLDQBCore or NewESX
    Locations = {
        {
            coords = vector3(-71.12, -1170.38, 25.04),
            hash = "a_m_o_soucent_01",
            heading = 10.5,
            marker = "Roulette Game"
        }
    }
}

function GetFramework()
    local Get = nil
    if Config.Framework == "ESX" then
        while Get == nil do
            TriggerEvent('esx:getSharedObject', function(Set) Get = Set end)
            Citizen.Wait(0)
        end
    elseif Config.Framework == "NewESX" then
        Get = exports['es_extended']:getSharedObject()
    elseif Config.Framework == "QBCore" then
        Get = exports["qb-core"]:GetCoreObject()
    elseif Config.Framework == "OldQBCore" then
        while Get == nil do
            TriggerEvent('QBCore:GetObject', function(Set) Get = Set end)
            Citizen.Wait(200)
        end
    end
    return Get
end
