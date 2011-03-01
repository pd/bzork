Bzork::Application.routes.draw do
  root :to => 'games#index'

  # I wanted /games/zork1.z3. But that breaks in routing, as it interprets
  # .z3 as the format. I could maybe do some sort of configuration to make
  # that acceptable, but instead: /play?story=zork1.z3. KISS.
  match 'games' => 'games#index'
  match 'play' => 'games#show', :as => :play
end
