class GamesController < ApplicationController
  def index
    @games = Dir[Rails.root.join('contrib', 'stories', '*').to_s].map { |f|
      File.basename f
    }
  end

  def show
    @game = params[:story]
  end
end
