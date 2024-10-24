Framework = nil
Framework = GetFramework()
Citizen.CreateThread(function()
    while Framework == nil do Citizen.Wait(750) end
    Citizen.Wait(2500)
 end)
Callback = Config.Framework == "ESX" or Config.Framework == "NewESX" and Framework.RegisterServerCallback or Framework.Functions.CreateCallback

Callback('GET', function(source, cb)
    local xPlayer, job
    if Config.Framework == "ESX" or Config.Framework == "NewESX" then
        xPlayer = Framework.GetPlayerFromId(tonumber(source))
        if xPlayer then
            local data = {
                cash = xPlayer.getMoney(),
            }
            cb(data, source)
        end
    else
        xPlayer = Framework.Functions.GetPlayer(source)
        if xPlayer then
            local data = {
                cash = xPlayer.Functions.GetMoney('cash'),
            }
            cb(data, source)
        end
    end
    if not xPlayer then
        print("Player not found: ", source)
        cb(nil, source)
    end
end)

Callback('CHECK&SET', function(source, cb, price)
    local xPlayer
    if Config.Framework == "ESX" or Config.Framework == "NewESX" then
        xPlayer = Framework.GetPlayerFromId(tonumber(source))
        if xPlayer then
            local playerMoney = xPlayer.getMoney()
            if playerMoney >= price then
                xPlayer.removeMoney(price)
                cb(true, source)
            else
                cb(false, source)
            end
        else
            print("Player not found: ", source)
            cb(false, source)
        end
    else
        xPlayer = Framework.Functions.GetPlayer(source)
        if xPlayer then
            local playerMoney = xPlayer.Functions.GetMoney('cash')
            if playerMoney >= price then
                xPlayer.Functions.RemoveMoney('cash', price)
                cb(true, source)
            else
                cb(false, source)
            end
        else
            print("Player not found: ", source)
            cb(false, source)
        end
    end
end)


Callback('ADD', function(source, cb, price)
    local xPlayer
    if Config.Framework == "ESX" or Config.Framework == "NewESX" then
        xPlayer = Framework.GetPlayerFromId(tonumber(source))
        if xPlayer then
            xPlayer.addMoney(price)
            cb(true, source)
        else
            print("Player not found: ", source)
            cb(false, source)
        end
    else
        xPlayer = Framework.Functions.GetPlayer(source)
        if xPlayer then
            xPlayer.Functions.AddMoney('cash', price)
            cb(true, source)
        else
            print("Player not found: ", source)
            cb(false, source)
        end
    end
end)
