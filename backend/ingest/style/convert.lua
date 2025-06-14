local routes =  osm2pgsql.define_table({
    name = 'routes',
    -- Define a composite primary key using both osm_id and osm_type
    ids = { type = 'any', id_column = 'id', type_column = 'type' },
    columns = {
        { column = 'name', type = 'text' },
        { column = 'ascent_m', type = 'real' },
        { column = 'descent_m', type = 'real' },
        { column = 'description', type = 'text' },
        { column = 'distance_m', type = 'real' },
        { column = 'color', type = 'text' },
        { column = 'from', type = 'text' },
        { column = 'osmc_symbol', type = 'text' },
        { column = 'roundtrip', type = 'text' },
        { column = 'to', type = 'text' },
        { column = 'website', type = 'text' },
        { column = 'geom', type = 'geometry', srid = 3857 },
    }
})

function parseValueToMeters(input_str, default_input_unit)
    if not input_str then
        return nil -- No input string
    end

    input_str = string.lower(input_str) -- Convert to lowercase for unit checking
    local value

    -- Try to extract a number from the beginning of the string
    local num_str = string.match(input_str, "^(%d+%.?%d*)")

    if num_str then
        value = tonumber(num_str)
    else
        return nil -- Could not extract a number
    end

    if not value then
        return nil -- tonumber failed
    end

    -- Check for explicit units first
    if string.find(input_str, "km") then
        return value * 1000 -- Kilometers to meters
    elseif string.find(input_str, "mi") or string.find(input_str, "mile") then
        return value * 1609.34 -- Miles to meters
    elseif string.find(input_str, "ft") or string.find(input_str, "feet") then
        return value * 0.3048 -- Feet to meters
    elseif string.find(input_str, "m") then
        return value -- Already in meters
    else
        -- If no explicit unit is found, use the default_input_unit
        default_input_unit = string.lower(default_input_unit or "m") -- Default to meters if not specified

        if default_input_unit == "km" then
            return value * 1000
        elseif default_input_unit == "mi" then
            return value * 1609.34
        elseif default_input_unit == "ft" then
            return value * 0.3048
        elseif default_input_unit == "m" then
            return value
        else
            -- Unknown default unit, return original value assuming meters as fallback
            return value
        end
    end
end

function osm2pgsql.process_relation(object)
    -- We can do filtering here if needed currently done using osmFilter maybe simpler to do it here; figure our performance?
    local tags = object.tags
    local route = {
        name = tags.name,
        ascent_m = parseValueToMeters(tags.ascent, 'm'),
        descent_m = parseValueToMeters(tags.descentm, 'm'),
        description = tags.description,
        distance_m = parseValueToMeters(tags.distance, 'km'),
        from = tags.from,
        symbol = tags['osmc:symbol'],
        roundtrip = tags.roundtrip,
        to = tags.to,
        website = tags.website,
        color = tags.colour,
        geom = object:as_multilinestring(),
        id= tags.osm_id,
        type= tags.osm_type
    }
    routes:insert(route)
end