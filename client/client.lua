Framework = nil
Framework = GetFramework()

Citizen.CreateThread(function()
   while Framework == nil do Citizen.Wait(750) end
   Citizen.Wait(2500)
end)

Callback = (Config.Framework == "ESX" or Config.Framework == "NewESX") and Framework.TriggerServerCallback or Framework.Functions.TriggerCallback

local display = false


RegisterNUICallback("price",function(data, cb)
    Callback("CHECK&SET", function(data) cb(data) 
    end, data)
end)


RegisterNUICallback("give",function(data, cb)
    Callback("ADD", function(data) cb(data) end, data)
end)


RegisterNUICallback("exit", function(data)
    SetDisplay(false)
    DestroyAllCams(true)
    RenderScriptCams(false, true, 1700, true, false, false)
    SetFocusEntity(GetPlayerPed(PlayerId()))
    DisplayRadar(true)
    DisplayHud(true)
end)

function SetDisplay(bool)
    display = bool
    SetNuiFocus(bool, bool)
end

Citizen.CreateThread(function()
    for _, v in pairs(Config.Locations) do
        RequestModel(v.hash)
        while not HasModelLoaded(v.hash) do
            Wait(1)
        end
        local x = v.coords.x
        local y = v.coords.y
        local z = v.coords.z
        local ped = CreatePed(4, v.hash, x, y, z, v.heading, false, true)
        SetEntityHeading(ped, v.heading)
        FreezeEntityPosition(ped, true)
        SetEntityInvincible(ped, true)
        SetBlockingOfNonTemporaryEvents(ped, true)
    end
end)

Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        local getPed = PlayerPedId()
        local coords = GetEntityCoords(getPed)
        for k, v in pairs(Config.Locations) do
            if v.coords then
                local dist = Vdist(coords.x, coords.y, coords.z, v.coords.x, v.coords.y, v.coords.z)
                if dist < 10 then
                    if dist < 3 then
                        local x = v.coords.x
                        local y = v.coords.y
                        local z = v.coords.z
                        DrawText3D(x, y, z + 2.10, "~g~" .. v.marker, 0.6, 4)
                        DrawText3D(x, y, z + 1.90, "Press [E] to interact", 0.4, 0)
                        if IsControlJustPressed(0, 38) then
                            Callback("GET", function(data)
                                SendNUIMessage({ data = 'ROULETTE', var = data })
                            end)
                            SetDisplay(true, true)
                        end
                        break
                    end
                end
            end
        end
    end
end)

function DrawText3D(x, y, z, text, scale, font)
    SetTextScale(scale or 0.35, scale or 0.35)
    SetTextFont(font or 4)
    SetTextProportional(1)
    SetTextColour(255, 255, 255, 215)
    SetTextEntry("STRING")
    SetTextCentre(true)
    AddTextComponentString(text)
    SetDrawOrigin(x, y, z, 0)
    DrawText(0.0, 0.0)
    local factor = (string.len(text)) / 370
    DrawRect(0.0, 0.0 + 0.0125, 0.017 + factor, 0.03, 0, 0, 0, 75)
    ClearDrawOrigin()
end
